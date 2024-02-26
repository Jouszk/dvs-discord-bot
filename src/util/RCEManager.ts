import { container } from "@sapphire/framework";
import { WebSocket, MessageEvent as MsgEvent } from "ws";
import { EventEmitter } from "events";
import nodeCron from "node-cron";
import { Time } from "@sapphire/time-utilities";
import { ignoredAttacker, RCEEventType } from "../vars";
import {
  ItemSpawn,
  RCERole,
  KillMessage,
  SocketData,
  NoteEdit,
} from "../interfaces";
import { Server } from "../servers";

class RCEManagerEvents extends EventEmitter {}

export default class RCEManager {
  private sockets: Map<string, WebSocket> = new Map();
  private isReconnecting: Map<string, boolean> = new Map();
  public emitter: RCEManagerEvents = new RCEManagerEvents();

  public constructor() {
    this.connectAllWs();
  }

  private async connectAllWs(): Promise<void> {
    container.servers.forEach((server) => {
      this.connectWsForServer(server);
    });
  }

  private async connectWsForServer(server: Server): Promise<void> {
    this.isReconnecting.set(server.id, false);

    while (
      !this.sockets.has(server.id) ||
      this.sockets.get(server.id).readyState !== WebSocket.OPEN
    ) {
      try {
        const socket = new WebSocket(
          `ws://${server.ipAddress}:${server.rconPort}/${server.ftpPassword}`
        );

        socket.addEventListener("error", (error) => {
          if (!this.isReconnecting.get(server.id)) {
            container.logger.ws(
              `[${error.message}] Failed to connect to RCE server ${server.ipAddress}:${server.rconPort}, retrying in 5 seconds`
            );
          }

          this.isReconnecting.set(server.id, true);

          setTimeout(() => {
            this.connectWsForServer(server);
          }, Time.Second * 5);

          socket.close();

          return;
        });

        await new Promise<void>((resolve) => {
          socket.addEventListener("open", () => {
            this.isReconnecting.set(server.id, false);
            container.logger.ws(
              `WebSocket connection established with RCE server ${server.ipAddress}:${server.rconPort}`
            );
            server.connected = true;
            resolve();
          });
        });

        this.sockets.set(server.id, socket);
        this.setupListeners(server, socket);
      } catch (error) {
        container.logger.error(error);
        await new Promise((resolve) => setTimeout(resolve, Time.Second * 5));
      }
    }
  }

  private setupListeners(server: Server, socket: WebSocket): void {
    socket.addEventListener("close", () => {
      if (!this.isReconnecting.get(server.id)) {
        container.logger.ws(
          `WebSocket connection closed with RCE server ${server.ipAddress}:${server.rconPort}, reconnecting in 5 seconds`
        );
        server.connected = false;
        this.isReconnecting.set(server.id, true);
        this.connectWsForServer(server);
      }
    });

    socket.addEventListener("error", (error) => {
      container.logger.error(error);
    });

    socket.addEventListener("message", (message) => {
      this.handleMessage(server, message);
    });
  }

  private handleMessage(server: Server, message: MsgEvent): void {
    const data: SocketData = JSON.parse(message.data.toString());
    const serverDetails = {
      id: server.id,
      name: server.name,
      ipAddress: server.ipAddress,
      port: server.rconPort,
    };

    // Kill Feed
    if (data.Message.includes("was killed by")) {
      const killObject: KillMessage = {
        victim: data.Message.split(" was killed by ")[0],
        attacker: data.Message.split(" was killed by ")[1].split("\x00")[0],
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
      data.Message.includes("joined [xboxone]") ||
      data.Message.includes("joined [ps4]")
    ) {
      const username = data.Message.split(" joined ")[0];
      this.emitter.emit(RCEEventType.PlayerJoin, {
        username,
        server: serverDetails,
      });
    }

    // Add to Role
    const roleMatch = data.Message.match(/\[(.*?)\]/g);
    if (roleMatch && data.Message.includes("Added")) {
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
    const itemSpawnMatch = data.Message.match(
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
    const noteEditMatch = data.Message.match(
      /\[NOTE PANEL\] Player \[ ([^\]]+) \] changed name from \[\s*([\s\S]*?)\s*\] to \[\s*([\s\S]*?)\s*\]/
    );
    if (noteEditMatch) {
      const username = noteEditMatch[1].trim();
      const oldContent = noteEditMatch[2].trim();
      const newContent = noteEditMatch[3].trim();

      const noteEdit: NoteEdit = {
        username,
        oldContent: oldContent.split("\n")[0],
        newContent: newContent.split("\n")[0],
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
    if (data.Message.includes("[event]")) {
      if (data.Message.includes("event_airdrop")) {
        this.emitter.emit(RCEEventType.EventMessage, {
          event: "Airdrop",
          server: serverDetails,
        });
      }

      if (data.Message.includes("event_cargoship")) {
        this.emitter.emit(RCEEventType.EventMessage, {
          event: "Cargo Ship",
          server: serverDetails,
        });
      }

      if (data.Message.includes("event_cargoheli")) {
        this.emitter.emit(RCEEventType.EventMessage, {
          event: "Chinook",
          server: serverDetails,
        });
      }

      if (data.Message.includes("event_helicopter")) {
        this.emitter.emit(RCEEventType.EventMessage, {
          event: "Patrol Helicopter",
          server: serverDetails,
        });
      }
    }
  }

  public sendCommandsToServer(serverId: string, commands: string[]): void {
    commands.forEach((command) => {
      this.sendCommandToServer(serverId, command);
    });
  }

  public sendCommandToServer(serverId: string, command: string): void {
    const socket = this.sockets.get(serverId);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          identifier: -1,
          message: command,
        })
      );
    } else {
      container.logger.error(
        `WebSocket connection for server ${serverId} is not open`
      );
    }
  }

  public setCron(
    serverId: string,
    name: string,
    time: string,
    commands: string[]
  ) {
    nodeCron.schedule(time, () => {
      container.logger.info(`Executing cron job: ${name}`);
      this.sendCommandsToServer(serverId, commands);
    });
  }
}
