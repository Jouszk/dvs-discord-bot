import {
  Listener,
  type ChatInputCommandSuccessPayload,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Listener.Options>({
  name: "chatInputCommandSuccess",
})
export default class ChatInputCommandSuccessListener extends Listener {
  public run({ interaction }: ChatInputCommandSuccessPayload) {
    this.container.logger.cmd(interaction.commandName, interaction.user.tag);
  }
}
