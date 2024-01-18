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
export class GameAdminApplicationButton extends InteractionHandler {
  public async parse(interaction: ButtonInteraction) {
    return interaction.customId === "game_admin_application"
      ? this.some()
      : this.none();
  }

  public async run(interaction: ButtonInteraction) {
    const modal = new ModalBuilder()
      .setCustomId("game_admin_application")
      .setTitle("Game Admin Application")
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
            .setCustomId("time_played")
            .setLabel("How much time have you played on Rust?")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(5)
            .setMaxLength(25)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("admin_experience")
            .setLabel("Do you have any previous admin experience?")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(250)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("application_reason")
            .setLabel("Why do you want to be an admin?")
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
              "You see four players doing an offline raid, what do you do?"
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
