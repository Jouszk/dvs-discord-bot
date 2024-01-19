import { container } from "@sapphire/framework";
import { WebSocket } from "ws";
import { EventEmitter } from "events";

export enum RCEEventType {
  ChatMessage = "rce-chat-message",
  WebSocketMessage = "rce-ws-message",
}

export interface SocketData {
  Message: string;
  Identifier: number;
  Type: "Generic" | "Chat";
  Stacktrace?: string;
}

export interface ChatMessage {
  Channel: number;
  Message: string;
  UserId: number;
  Username: string;
  Color: string;
  Time: number;
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
      // container.logger.debug(data);

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
}
