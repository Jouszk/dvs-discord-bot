import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ModalSubmitInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class ChangeChatColorModal extends InteractionHandler {
  public async parse(interaction: ModalSubmitInteraction) {
    return interaction.customId === "change_chat_color"
      ? this.some()
      : this.none();
  }

  public async run(interaction: ModalSubmitInteraction) {
    // Get the content from the modal
    const newColor = interaction.fields
      .getTextInputValue("color")
      .replace("#", "");

    // Check if the color is a valid hex color without the # using a regex
    if (!/^[0-9A-F]{6}$/i.test(newColor)) {
      return await interaction.reply({
        content: "Invalid color, please provide a valid HEX color",
        ephemeral: true,
      });
    }

    // Update the user's chat color in the database
    const linkedAccount = await this.container.db.linkedAccount.findFirst({
      where: {
        discordId: interaction.user.id,
      },
    });

    if (!linkedAccount) {
      return await interaction.reply({
        content:
          "Your Discord account is not linked to an in-game account, use the `/link` command to link your account",
        ephemeral: true,
      });
    }

    const vipData = await this.container.db.vIPUser.findFirst({
      where: {
        id: linkedAccount.id,
      },
    });

    if (!vipData) {
      return await interaction.reply({
        content: "You need to be a VIP to change your chat color",
        ephemeral: true,
      });
    }

    await this.container.db.vIPUser.update({
      where: {
        id: linkedAccount.id,
      },
      data: {
        chatColor: newColor,
      },
    });

    return await interaction.reply({
      content: "Chat color updated successfully",
      ephemeral: true,
    });
  }
}
