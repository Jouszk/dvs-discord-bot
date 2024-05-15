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
export class ChangeChatColorButton extends InteractionHandler {
  public async parse(interaction: ButtonInteraction) {
    return interaction.customId === "change_chat_color"
      ? this.some()
      : this.none();
  }

  public async run(interaction: ButtonInteraction) {
    const modal = new ModalBuilder()
      .setCustomId("change_chat_color")
      .setTitle("Change Global Chat Color")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("color_hex")
            .setLabel("Which color would you like to use? (HEX)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(6)
            .setMaxLength(7)
        )
      );

    return await interaction.showModal(modal);
  }
}
