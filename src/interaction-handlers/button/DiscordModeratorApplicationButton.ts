import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import {
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class DiscordModeratorApplicationButton extends InteractionHandler {
  public async parse(interaction: ButtonInteraction) {
    return interaction.customId === "discord_moderator_application"
      ? this.some()
      : this.none();
  }

  public async run(interaction: ButtonInteraction) {
    const modal = new ModalBuilder()
      .setCustomId("discord_moderator_application")
      .setTitle("Discord Moderator Application")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("in_game_name")
            .setLabel("What is your Xbox / PSN Username?")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(3)
            .setMaxLength(25)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("mod_experience")
            .setLabel("Do you have any moderator experience?")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(250)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("application_reason")
            .setLabel("Why do you want to be a moderator?")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(25)
            .setMaxLength(250)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("scenario")
            .setLabel("SCENARIO: Read the placeholder text!")
            .setPlaceholder(
              "Your moderator decisions are being criticized by several members, how do you handle this?"
            )
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(25)
            .setMaxLength(250)
        )
      );

    return await interaction.showModal(modal);
  }
}
