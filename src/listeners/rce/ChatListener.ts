import { Listener, container } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ChatMessage } from "../../interfaces";
import { RCEEventType } from "../../vars";

@ApplyOptions<Listener.Options>({
  name: RCEEventType.ChatMessage,
  emitter: container.rce.emitter,
})
export default class MessageDeleteListener extends Listener {
  public async run(message: ChatMessage) {
    // this.container.logger.debug(
    //   `[RCE] ${message.Username}: ${message.Message}`
    // );
  }
}
