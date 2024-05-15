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
      include: {
        vip: true,
      },
    });

    if (!data) {
      return interaction.reply({
        content:
          "Your Discord account is not linked to an in-game account, use the `/link` command to link your account",
        ephemeral: true,
      });
    }

    let claimEligible = false;

    if (data.vip && data.vip.plan === "VIP_PLUS") {
      if (data.vip.claimed) {
        claimEligible = false;
      } else {
        claimEligible = true;
      }
    }

    const vipDaysLeft = data.vip
      ? Math.floor((data.vip.expiresAt.getTime() - Date.now()) / 86400000)
      : 0;

    const embed = new EmbedBuilder()
      .setColor(
        data.vip
          ? (data.vip.chatColor as ColorResolvable)
          : (process.env.DISCORD_BOT_THEME as ColorResolvable)
      )
      .setAuthor({
        name: `Profile | ${data.id}`,
        iconURL: interaction.guild.iconURL(),
      })
      .setImage(process.env.DISCORD_BOT_EMBED_FOOTER_URL)
      .addField(
        "VIP Status",
        data.vip
          ? `Active (\`${vipDaysLeft} days left\`)\n${plans[data.vip.plan]}`
          : "Inactive",
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
        .setDisabled(data.vip ? false : true)
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
