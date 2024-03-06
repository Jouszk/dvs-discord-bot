import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ModalSubmitInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class TokenModal extends InteractionHandler {
  public async parse(interaction: ModalSubmitInteraction) {
    return interaction.customId === "token_modal" ? this.some() : this.none();
  }

  public async run(interaction: ModalSubmitInteraction) {
    // Get the content from the modal
    const refreshToken = interaction.fields.getTextInputValue("refresh_token");

    // Set the refresh token
    this.container.settings.set("global", "gportal.auth", {
      refresh_token: refreshToken,
    });

    await this.container.rce._init();
    if (!this.container.rce.auth) {
      return interaction.reply({
        content: "Failed to authenticate with the provided refresh token.",
        ephemeral: true,
      });
    }

    // Send a reply
    return interaction.reply({
      content: "Refresh token has been set.",
      ephemeral: true,
    });
  }
}
