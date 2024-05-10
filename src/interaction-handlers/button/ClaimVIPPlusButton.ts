import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ButtonInteraction, EmbedBuilder } from "discord.js";
import crypto from "crypto";

interface RedeemKey {
  key: string;
  commands: string[];
  name: string;
}

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class GameAdminApplicationButton extends InteractionHandler {
  public async parse(interaction: ButtonInteraction) {
    return interaction.customId === "claim_vip_plus"
      ? this.some()
      : this.none();
  }

  public async run(interaction: ButtonInteraction) {
    const data = await this.container.db.linkedAccount.findFirst({
      where: {
        discordId: interaction.user.id,
      },
    });

    if (!data) {
      return interaction.reply({
        content:
          "Your Discord account is not linked to an in-game account, use the `/link` command to link your account",
        ephemeral: true,
      });
    }

    const vipData = await this.container.db.vIPUser.findFirst({
      where: {
        id: data.id,
      },
    });

    if (!vipData) {
      return interaction.reply({
        content: "You are not a VIP member, open a ticket to purchase VIP",
        ephemeral: true,
      });
    }

    let claimEligible = false;

    if (vipData && vipData.plan === "VIP_PLUS") {
      claimEligible = !vipData.claimed;
    }

    if (!claimEligible) {
      return interaction.reply({
        content:
          "You are not eligible to claim VIP+ benefits at this time, either because you are not a VIP+ member or you have already claimed your benefits this wipe",
        ephemeral: true,
      });
    }

    await this.container.db.vIPUser.update({
      where: {
        id: data.id,
      },
      data: {
        claimed: true,
      },
    });

    // Create the keys
    const redeemKeys: RedeemKey[] = this.container.settings.get(
      "global",
      "keys",
      []
    );

    const key1 = this.generateKey(12);
    const key2 = this.generateKey(12);

    redeemKeys.push({
      key: key1,
      commands: ['kit givetoplayer t3base "{username}"'],
      name: "VIP+ Tier 3 Base",
    });

    redeemKeys.push({
      key: key2,
      commands: [
        'inventory.giveto "{username}" "electric.generator.small" "1"',
      ],
      name: "VIP+ Test Generator",
    });

    // Save the keys
    this.container.settings.set("global", "keys", redeemKeys);

    const embed = new EmbedBuilder()
      .setColor("#4caf50")
      .setTitle("VIP+ Benefits Claimed")
      .setDescription(
        `Your VIP+ benefits have been claimed, here are your keys which can be redeemed using the \`/redeem\` command:\n\nVIP+ Tier 3 Base: \`${key1}\`\nVIP+ Test Generator: \`${key2}\``
      );

    interaction.user.send({ embeds: [embed] }).catch(() => null);

    return interaction.reply({
      content: `Here are your VIP+ benefits, check your DMs for your keys:\n\nVIP+ Tier 3 Base: \`${key1}\`\nVIP+ Test Generator: \`${key2}\``,
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
