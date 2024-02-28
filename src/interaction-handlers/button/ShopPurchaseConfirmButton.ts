import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ButtonInteraction } from "discord.js";
import { shopPacks } from "../../vars";
import crypto from "crypto";

interface RedeemKey {
  key: string;
  commands: string[];
  name: string;
}

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class ShopPurchaseConfirmButton extends InteractionHandler {
  public async parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("shop_purchase_confirm")) {
      return this.none();
    }

    return this.some(interaction.customId.split("-")[1]);
  }

  public async run(interaction: ButtonInteraction, itemId: number) {
    const economy = await this.container.db.economyUser.findFirst({
      where: {
        id: interaction.user.id,
      },
    });

    const item = shopPacks.find((pack) => pack.id === Number(itemId));

    if (!item) {
      return await interaction.reply({
        content: "That item ID does not exist.",
        ephemeral: true,
      });
    }

    if (economy?.balance < item.price) {
      return await interaction.reply({
        content: "You do not have enough DvS Coins to purchase this item.",
        ephemeral: true,
      });
    }

    await this.container.db.economyUser.update({
      where: {
        id: interaction.user.id,
      },
      data: {
        balance: {
          decrement: item.price,
        },
      },
    });

    // Create the keys
    const redeemKeys: RedeemKey[] = this.container.settings.get(
      "global",
      "keys",
      []
    );

    const key = this.generateKey(12);

    redeemKeys.push({
      key,
      commands: item.commands,
      name: item.name,
    });

    // Save the keys
    this.container.settings.set("global", "keys", redeemKeys);

    // Send Response
    return await interaction.reply({
      content: `You have successfully purchased **${item.name}** for <:dvscoin:1212382310645628958> **${item.price} DvS Coins**. Your redeem key is: \`${key}\``,
      ephemeral: true,
    });
  }

  private generateKey(length: number) {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString("hex")
      .slice(0, length);
  }
}
