import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  ModalBuilder,
  type ChatInputCommandInteraction,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "token",
  description: "Set GPORTAL refresh token",
  preconditions: ["OwnerOnly"],
})
export default class TokenCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand(
      (command) => {
        command
          .setName(this.name)
          .setDescription(this.description)
          .setDefaultMemberPermissions(0);
      },
      {
        idHints: [],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const modal = new ModalBuilder()
      .setCustomId("token_modal")
      .setTitle("Set GPORTAL Refresh Token")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("refresh_token")
            .setLabel("GPORTAL Refresh Token")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        )
      );

    // Send Modal
    return await interaction.showModal(modal);
  }
}
