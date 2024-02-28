import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalSubmitInteraction,
} from "discord.js";
import { shopPacks } from "../../vars";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class ShopPurchaseModal extends InteractionHandler {
  public async parse(interaction: ModalSubmitInteraction) {
    return interaction.customId === "shop_purchase" ? this.some() : this.none();
  }

  public async run(interaction: ModalSubmitInteraction) {
    // Get the content from the modal
    const itemId = interaction.fields.getTextInputValue("item_id");

    if (!Number(itemId)) {
      return await interaction.reply({
        content: "You must enter a valid item ID.",
        ephemeral: true,
      });
    }

    // Get the item from the shopPacks array
    const item = shopPacks.find((pack) => pack.id === Number(itemId));

    if (!item) {
      return await interaction.reply({
        content: "That item ID does not exist.",
        ephemeral: true,
      });
    }

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`shop_purchase_confirm-${item.id}`)
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("shop_purchase_cancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger)
    );

    // Send item confirmation
    return await interaction.reply({
      content: `You are about to purchase **${item.name}** for <:dvscoin:1212382310645628958> **${item.price} DvS Coins**. Are you sure?`,
      components: [actionRow],
      ephemeral: true,
    });
  }
}
