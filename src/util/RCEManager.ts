import { container } from "@sapphire/framework";
import { WebSocket, MessageEvent as MsgEvent } from "ws";
import { EventEmitter } from "events";
import { Time } from "@sapphire/time-utilities";
import { Server, servers } from "../servers";
import { ItemSpawn, KillMessage, NoteEdit, RCERole } from "../interfaces";
import { RCEEventType, RULES, ignoredAttacker } from "../vars";
import nodeCron from "node-cron";

enum GPORTAL_WS_TYPE {
  MaintenanceLockState = 1,
  ServiceState = 2,
  ServiceSensors = 3,
  ConsoleMessages = 4,
  GameServerQuery = 5,
  ServiceEvents = 6,
}

interface GPORTALConsoleMessagePayload {
  stream: string;
  message: string;
  __typename: string;
  channel: string;
}

interface GPORTALConsoleMessage {
  type: string;
  id: number;
  payload: { data: { consoleMessages: GPORTALConsoleMessagePayload } };
}

const GPORTAL_COMMAND_ROUTE = "https://www.g-portal.com/ngpapi/";
const GPORTAL_REFRESH_ROUTE =
  "https://auth.g-portal.com/auth/realms/master/protocol/openid-connect/token";
const GPORTAL_WEBSOCKET = "wss://www.g-portal.com/ngpapi/";

interface GPORTALAuth {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
}

interface GPORTALConsoleResponse {
  ok: boolean;
  __typename: string;
}

class RCEManagerEvents extends EventEmitter {}

export default class RCEManager {
  private sockets: Map<string, WebSocket> = new Map();
  private reconnecting: Map<string, boolean> = new Map();
  public auth: GPORTALAuth;
  public emitter: RCEManagerEvents = new RCEManagerEvents();
  public population: Map<string, string[]> = new Map();

  public constructor() {
    this._init();
  }

  public async _init() {
    await this.refreshAuth();

    servers.forEach(async (server) => {
      await this.connect(server);
    });
  }

  private async connect(server: Server) {
    if (!this.auth) return;

    container.logger.ws(
      `Connecting to GPORTAL WebSocket for ${server.name} [${server.serverId}]`
    );
    this.reconnecting.set(server.id, false);

    while (
      !this.sockets.has(server.id) ||
      this.sockets.get(server.id).readyState !== WebSocket.OPEN
    ) {
      try {
        const socket = new WebSocket(GPORTAL_WEBSOCKET, ["graphql-ws"], {
          headers: {
            origin: "https://www.g-portal.com",
            host: "www.g-portal.com",
          },
          timeout: 60_000,
        });

        // Error handling
        socket.addEventListener("error", (error) => {
          if (!this.reconnecting.get(server.id)) {
            container.logger.ws(
              `[${error.message}] Failed to connect to GPORTAL WebSocket for ${server.name} [${server.serverId}]. Retrying in 5 seconds...`
            );
          }

          this.reconnecting.set(server.id, true);

          setTimeout(() => {
            this.connect(server);
          }, Time.Second * 5);

          socket.close();
          return;
        });

        await new Promise<void>((resolve) => {
          socket.addEventListener("open", async () => {
            this.reconnecting.set(server.id, false);
            container.logger.ws(
              `Connected to GPORTAL WebSocket for ${server.name} [${server.serverId}]`
            );

            server.connected = true;

            // Authenticate with the websocket
            socket.send(
              JSON.stringify({
                type: "connection_init",
                payload: {
                  authorization: `${this.auth.token_type} ${this.auth.access_token}`,
                },
              })
            );

            // Open the console messages
            socket.send(
              JSON.stringify({
                id: GPORTAL_WS_TYPE.ConsoleMessages,
                type: "start",
                payload: {
                  variables: {
                    sid: server.serverId,
                    region: server.region,
                  },
                  extensions: {},
                  operationName: "consoleMessages",
                  query:
                    "subscription consoleMessages($sid: Int!, $region: REGION!) {\n  consoleMessages(rsid: {id: $sid, region: $region}) {\n    stream\n    message\n    __typename\n  }\n}",
                },
              })
            );

            // Send a ping every 30 seconds
            setInterval(() => {
              if (socket.readyState !== WebSocket.OPEN) return;
              socket.send(JSON.stringify({ type: "ka" }));
            }, 30_000);

            // Sleep for 10 seconds to ensure logs dont get spammed
            // await this.sleep(10_000);

            resolve();
          });
        });

        this.sockets.set(server.id, socket);

        await this.fetchPopulation(server);
        setInterval(async () => {
          await this.fetchPopulation(server);
        }, 5 * 60_000);

        this.setupListeners(server, socket);
      } catch (err) {}
    }
  }

  private async fetchPopulation(server: Server) {
    await this.sendCommand(server, "Users");
  }

  private async setupListeners(server: Server, socket: WebSocket) {
    // Check if websocket closes / disconnects
    socket.addEventListener("close", () => {
      if (!this.reconnecting) {
        container.logger.ws(
          "Disconnected from GPORTAL WebSocket. Retrying in 5 seconds..."
        );

        server.connected = false;
      }

      server.connected = false;
      this.reconnecting.set(server.id, true);
      this.connect(server);
    });

    // Error listener
    socket.addEventListener("error", (error) => {
      container.logger.ws(
        `An error occurred in the GPORTAL WebSocket - ${server.name} [${server.serverId}]: ${error.message}`
      );
    });

    // Receive messages
    socket.addEventListener("message", (message) => {
      const data: GPORTALConsoleMessage = JSON.parse(message.data.toString());

      // Handle message
      this.handleMessage(server, data);
    });
  }

  private handleMessage(server: Server, data: GPORTALConsoleMessage): void {
    const serverDetails = {
      id: server.id,
      name: server.name,
      pvp: server.pvp,
    };

    const logMessages = data?.payload?.data?.consoleMessages?.message?.split(
      /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}:LOG:DEFAULT: /gm
    );

    logMessages.forEach((logMessage) => {
      const message = logMessage.trim();

      if (!message || message.startsWith("Executing console system command"))
        return;

      // Population Handler
      if (message.startsWith("<slot:")) {
        const users = message
          .match(/"(.*?)"/g)
          .map((username) => username.replace(/"/g, ""));

        users.shift();
        this.population.set(server.id, users);
        return;
      }

      this.emitter.emit(RCEEventType.WebSocketMessage, {
        message,
        server: serverDetails,
      });

      // Kill Feed
      if (message.includes("was killed by")) {
        const killObject: KillMessage = {
          victim: message.split(" was killed by ")[0],
          attacker: message.split(" was killed by ")[1].split("\x00")[0],
        };

        // Ignore if attacker or victim is in ignoredAttacker array
        if (
          ignoredAttacker.includes(killObject.attacker.toLowerCase()) ||
          ignoredAttacker.includes(killObject.victim.toLowerCase()) ||
          Number(killObject.attacker) ||
          Number(killObject.victim)
        ) {
          return;
        }

        this.emitter.emit(RCEEventType.KillMessage, {
          kill: killObject,
          server: serverDetails,
        });
      }

      // Player Joining
      if (
        message.includes("joined [xboxone]") ||
        message.includes("joined [ps4]")
      ) {
        const username = message.split(" joined ")[0];
        this.emitter.emit(RCEEventType.PlayerJoin, {
          username,
          server: serverDetails,
        });
      }

      // Add to Role
      const roleMatch = message.match(/\[(.*?)\]/g);
      if (roleMatch && message.includes("Added")) {
        const rceRole: RCERole = {
          inGameName: roleMatch[1],
          role: roleMatch[2],
        };

        this.emitter.emit(RCEEventType.AddRole, {
          role: rceRole,
          server: serverDetails,
        });
      }

      // Item Spawning
      const itemSpawnMatch = message.match(
        /\[ServerVar\] giving\s+(\w+)\s+(\d+)\s*x\s+(.+)\x00/
      );
      if (itemSpawnMatch) {
        const itemSpawn: ItemSpawn = {
          receiver: itemSpawnMatch[1],
          amount: parseInt(itemSpawnMatch[2], 10),
          item: itemSpawnMatch[3],
        };

        this.emitter.emit(RCEEventType.ItemSpawnMessage, {
          spawn: itemSpawn,
          server: serverDetails,
        });
      }

      // Note Editing
      const noteEditMatch = message.match(
        /\[NOTE PANEL\] Player \[ ([^\]]+) \] changed name from \[\s*([\s\S]*?)\s*\] to \[\s*([\s\S]*?)\s*\]/
      );
      if (noteEditMatch) {
        const username = noteEditMatch[1].trim();
        const oldContent = noteEditMatch[2].trim();
        const newContent = noteEditMatch[3].trim();

        const noteEdit: NoteEdit = {
          username,
          oldContent: oldContent.split("\\n")[0],
          newContent: newContent.split("\\n")[0],
        };

        if (
          noteEdit.newContent.length > 0 &&
          noteEdit.oldContent !== noteEdit.newContent
        ) {
          this.emitter.emit(RCEEventType.NoteEdit, {
            note: noteEdit,
            server: serverDetails,
          });
        }
      }

      // Events
      if (message.includes("[event]")) {
        if (message.includes("event_airdrop")) {
          this.emitter.emit(RCEEventType.EventMessage, {
            event: "Airdrop",
            server: serverDetails,
          });
        }

        if (message.includes("event_cargoship")) {
          this.emitter.emit(RCEEventType.EventMessage, {
            event: "Cargo Ship",
            server: serverDetails,
          });
        }

        if (message.includes("event_cargoheli")) {
          this.emitter.emit(RCEEventType.EventMessage, {
            event: "Chinook",
            server: serverDetails,
          });
        }

        if (message.includes("event_helicopter")) {
          this.emitter.emit(RCEEventType.EventMessage, {
            event: "Patrol Helicopter",
            server: serverDetails,
          });
        }
      }
    });
  }

  public async refreshAuth(): Promise<GPORTALAuth | null> {
    container.logger.debug("Refreshing GPORTAL Auth");
    const auth: GPORTALAuth = container.settings.get(
      "global",
      "gportal.auth",
      null
    );

    if (!auth) {
      this.auth = null;
      return null;
    }

    const request = await fetch(GPORTAL_REFRESH_ROUTE, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: "website",
        refresh_token: auth.refresh_token,
      }),
    });

    if (!request.ok || request.status !== 200) {
      container.logger.debug("Failed to refresh GPORTAL Auth");
      this.auth = null;
      return null;
    }

    const json: GPORTALAuth = await request.json();
    container.settings.set("global", "gportal.auth", json);
    this.auth = json;

    container.logger.debug("Successfully refreshed GPORTAL Auth");

    setTimeout(() => this.refreshAuth(), json.expires_in * 1e3);
    return json;
  }

  public async sendCommands(
    server: Server,
    commands: string[]
  ): Promise<boolean> {
    let sentAll = true;

    for (const command of commands) {
      const success = await this.sendCommand(server, command);
      if (!success) sentAll = false;
      await this.sleep(1_000);
    }

    return sentAll;
  }

  public async sendCommand(server: Server, command: string): Promise<boolean> {
    if (!this.sockets.has(server.id) || !this.auth) return false;

    const data = {
      operationName: "sendConsoleMessage",
      variables: {
        sid: server.serverId,
        region: server.region,
        message: command,
      },
      query:
        "mutation sendConsoleMessage($sid: Int!, $region: REGION!, $message: String!) {\n  sendConsoleMessage(rsid: {id: $sid, region: $region}, message: $message) {\n    ok\n    __typename\n  }\n}",
    };

    const request = await fetch(GPORTAL_COMMAND_ROUTE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${this.auth.token_type} ${this.auth.access_token}`,
      },
      body: JSON.stringify(data),
    });

    if (!request.ok || request.status !== 200) return false;

    const json: { data: { sendConsoleMessage: GPORTALConsoleResponse } } =
      await request.json();
    return json?.data?.sendConsoleMessage?.ok ?? false;
  }

  public setCron(
    server: Server,
    name: string,
    time: string,
    commands: string[]
  ) {
    nodeCron.schedule(time, async () => {
      container.logger.debug(
        `Running cron job for ${name} on server: ${server.name} [${server.serverId}]`
      );

      await this.sendCommands(server, commands);
    });
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
