import { container } from "@sapphire/framework";
import { WebSocket } from "ws";
import { EventEmitter } from "events";
import nodeCron from "node-cron";

const ignoredAttacker = [
  "thirst",
  "hunger",
  "guntrap.deployed",
  "pee pee 9000",
  "barricade.wood",
  "wall.external.high.stone",
  "wall.external.high",
  "gates.external.high.wood",
  "gates.external.high.stone",
  "gates.external.high.stone (entity)",
  "bear",
  "autoturret_deployed",
  "cold",
  "bleeding",
  "boar",
  "wolf",
  "fall",
  "drowned",
  "radiation",
  "autoturret_deployed (entity)",
  "bear (bear)",
  "boar (boar)",
  "wolf (wolf)",
  "guntrap.deployed (entity)",
  "fall!",
  "lock.code (entity)",
  "bradleyapc (entity)",
  "wall.external.high.stone (entity)",
  "barricade.metal (entity)",
  "spikes.floor (entity)",
  "sentry.bandit.static (entity)",
  "cactus-6 (entity)",
  "cactus-5 (entity)",
  "cactus-4 (entity)",
  "cactus-3 (entity)",
  "cactus-2 (entity)",
  "cactus-1 (entity)",
  "landmine (entity)",
  "wall.external.high.wood (entity)",
  "sentry.scientist.static (entity)",
  "patrolhelicopter (entity)",
];

export enum RCEEventType {
  ChatMessage = "rce-chat-message",
  WebSocketMessage = "rce-ws-message",
  KillMessage = "rce-kill-message",
  ItemSpawnMessage = "rce-item-spawn-message",
  EventMessage = "rce-event-message",
}

export interface SocketData {
  Message: string;
  Identifier: number;
  Type: "Generic" | "Chat";
  Stacktrace?: string;
}

export interface ItemSpawn {
  item: string;
  amount: number;
  receiver: string;
}

export interface ChatMessage {
  Channel: number;
  Message: string;
  UserId: number;
  Username: string;
  Color: string;
  Time: number;
}

export interface KillMessage {
  attacker: string;
  victim: string;
}

class RCEManagerEvents extends EventEmitter {}

export default class RCEManager {
  private socket: WebSocket;
  public emitter: RCEManagerEvents;

  public constructor() {
    this.socket = new WebSocket(
      `ws://${process.env.RUST_IP_ADDRESS}:${process.env.RUST_RCON_PORT}/${process.env.RUST_FTP_PASSWORD}`
    );

    this.emitter = new RCEManagerEvents();

    this.socket.addEventListener("open", () => {
      container.logger.info("WebSocket connection established with RCE server");
    });

    this.socket.addEventListener("close", () => {
      container.logger.info("WebSocket connection closed with RCE server");
    });

    this.socket.addEventListener("error", (error) => {
      container.logger.error(error);
    });

    this.socket.addEventListener("message", (message) => {
      const data: SocketData = JSON.parse(message.data.toString());

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

        this.emitter.emit(RCEEventType.KillMessage, killObject);
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

        this.emitter.emit(RCEEventType.ItemSpawnMessage, itemSpawn);
      }

      // Events
      if (data.Message.includes("[event]")) {
        if (data.Message.includes("event_airdrop")) {
          this.emitter.emit(RCEEventType.EventMessage, "Airdrop");
        }

        if (data.Message.includes("event_cargoship")) {
          this.emitter.emit(RCEEventType.EventMessage, "Cargo Ship");
        }

        if (data.Message.includes("event_cargoheli")) {
          this.emitter.emit(RCEEventType.EventMessage, "Chinook");
        }

        if (data.Message.includes("event_helicopter")) {
          this.emitter.emit(RCEEventType.EventMessage, "Patrol Helicopter");
        }
      }

      switch (data.Type) {
        case "Chat":
          const chatMessage: ChatMessage = JSON.parse(data.Message);
          this.emitter.emit(RCEEventType.ChatMessage, chatMessage);
          break;
        case "Generic":
          this.emitter.emit(RCEEventType.WebSocketMessage, data);
          break;
        default:
          container.logger.warn("Unknown RCE message type", data);
          break;
      }
    });
  }

  public sendCommand(command: string): void {
    this.socket.send(
      JSON.stringify({
        identifier: -1,
        message: command,
      })
    );
  }

  public sendCommands(commands: string[]): void {
    commands.map(async (command) => {
      await this.sendCommand(command);
    });
  }

  public setCron(name: string, time: string, commands: string[]) {
    nodeCron.schedule(time, () => {
      container.logger.info(`Executing cron job: ${name}`);
      this.sendCommands(commands);
    });
  }
}
