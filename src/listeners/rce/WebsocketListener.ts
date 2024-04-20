import { Listener, container } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { RCEEventType } from "../../vars";
import { WSEvent } from "../../interfaces";

@ApplyOptions<Listener.Options>({
  name: RCEEventType.WebSocketMessage,
  emitter: container.rce.emitter,
})
export default class WebsocketListener extends Listener {
  public async run(data: WSEvent) {
    // if (process.env.NODE_ENV !== "production") return;

    this.container.logger.gportal(data.server.name, data.message);
  }
}
