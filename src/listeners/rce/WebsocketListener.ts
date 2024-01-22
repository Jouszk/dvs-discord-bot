import { Listener, container } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { RCEEventType, SocketData } from "../../util/RCEManager";

@ApplyOptions<Listener.Options>({
  name: RCEEventType.WebSocketMessage,
  emitter: container.rce.emitter,
})
export default class WebsocketListener extends Listener {
  public async run(data: SocketData) {
    this.container.logger.debug(`[RCE] ${data.Type}: ${data.Message}`);
  }
}
