import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ColorResolvable,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

const plans = {
  VIP_BASIC: "VIP Basic",
  VIP_PLUS: "VIP Plus",
};

@ApplyOptions<Command.Options>({
  name: "profile",
  description: "View information about your in-game account",
})
export default class ProfileCommand extends Command {
  public async chatInputRun(interaction: ChatInputCommandInteraction) {
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

    let claimEligible = false;

    if (vipData && vipData.plan === "VIP_PLUS") {
      if (vipData.claimed) {
        claimEligible = false;
      } else {
        claimEligible = true;
      }
    }

    const vipDaysLeft = vipData
      ? Math.floor((vipData.expiresAt.getTime() - Date.now()) / 86400000)
      : 0;

    const embed = new EmbedBuilder()
      .setColor(
        vipData
          ? (vipData.chatColor as ColorResolvable)
          : (process.env.DISCORD_BOT_THEME as ColorResolvable)
      )
      .setAuthor({
        name: `Profile | ${data.id}`,
        iconURL: interaction.guild.iconURL(),
      })
      .setImage(process.env.DISCORD_BOT_EMBED_FOOTER_URL)
      .addField(
        "VIP Status",
        vipData ? `Active (\`${vipDaysLeft} days left\`)` : "Inactive",
        true
      );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("unlink_ign")
        .setLabel("Unlink")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("claim_vip_plus")
        .setLabel("Claim VIP Plus Benefits")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(claimEligible ? false : true),
      new ButtonBuilder()
        .setCustomId("change_chat_color")
        .setLabel("Change Global Chat Color")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(vipData ? false : true)
    );

    interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  }

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
}
