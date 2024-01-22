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
  name: "redeem",
  description: "Redeem a redeem key",
})
export default class RedeemCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand(
      (command) => {
        command.setName(this.name).setDescription(this.description);
      },
      {
        idHints: [],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const modal = new ModalBuilder()
      .setCustomId("redeem_key")
      .setTitle("Redeem a Key")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("in_game_name")
            .setLabel("What is your Xbox / PSN Username?")
            .setPlaceholder("i.e. Saucey Hub (it is important to be exact)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(3)
            .setMaxLength(25)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("redeem_key")
            .setLabel("Redeem Key")
            .setPlaceholder("This is provided to you by an admin")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(12)
            .setMaxLength(12)
        )
      );

    // Send Modal
    return await interaction.showModal(modal);
  }
}
