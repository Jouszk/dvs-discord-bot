import { Listener, container } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { SocketData } from "../../interfaces";
import { RCEEventType } from "../../vars";

@ApplyOptions<Listener.Options>({
  name: RCEEventType.WebSocketMessage,
  emitter: container.rce.emitter,
})
export default class WebsocketListener extends Listener {
  public async run(data: SocketData) {
    if (process.env.NODE_ENV !== "production") return;

    this.container.logger.gportal(data.Message);
  }
}
