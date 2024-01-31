import { container } from "@sapphire/framework";
import {
  type TextChannel,
  type User,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ColorResolvable,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { Time } from "@sapphire/time-utilities";

export enum ModerationType {
  "Warn" = 1,
  "Timeout" = 2,
  "Kick" = 3,
  "Ban" = 4,
  "Unban" = 5,
  "RemoveTimeout" = 6,
}

export const moderationType = {
  "1": "Warn",
  "2": "Timeout",
  "3": "Kick",
  "4": "Ban",
  "5": "Unban",
  "6": "Remove Timeout",
};

export const embedColor = {
  "1": "#fffa65",
  "2": "#4b4b4b",
  "3": "#ff9f1a",
  "4": "#ff3838",
  "5": "#32ff7e",
  "6": "#32ff7e",
};

export const embedEmoji = {
  "1": "⚠️",
  "2": "🕒",
  "3": "🥾",
  "4": "🔨",
  "5": "✅",
  "6": "✅",
};

export default class ModerationUtils {
  public static async getModerationPoints(user: User): Promise<number> {
    // Get the moderations from the database that are within the last 6 months
    const data = await container.db.moderation.findMany({
      where: {
        userId: user.id,
        type: { in: [1, 2, 3] },
        createdAt: { gte: new Date(Date.now() - Time.Month * 6) },
      },
    });

    // Return the total points
    return data.reduce((a, b) => a + b.type, 0);
  }

  public static async autoModeration(user: User): Promise<void> {
    // Get the moderation points for the user
    const points = await this.getModerationPoints(user);
    const reason = "Automatic ban for exceeding 8 moderation points.";

    // If the user has 8 or more points, ban them
    if (points >= 8) {
      await this.addModeration(
        user.id,
        container.client.user.id,
        ModerationType.Ban,
        reason,
        reason
      );

      await container.client.guilds.cache.first().members.ban(user, {
        reason,
      });
    }
  }

  private static async sendModerationLog(
    caseId: number,
    user: User,
    moderator: User,
    type: ModerationType,
    reason: string
  ) {
    // Create embed for the log
    const embed = new EmbedBuilder()
      .setThumbnail(user.displayAvatarURL())
      .setTitle(`${embedEmoji[type]} Case #${caseId} | ${moderationType[type]}`)
      .addField("User", `${user} (\`${user.id}\`)`, true)
      .addField("Moderator", `${moderator} (\`${moderator.id}\`)`, true)
      .addField("Reason", reason)
      .setFooter({ text: `ID: ${caseId}` })
      .setColor(embedColor[type] as ColorResolvable);

    // Create buttons for the embed
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`view_moderation_${caseId}`)
        .setLabel("View")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`change_moderation_${caseId}`)
        .setLabel("Update")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`delete_moderation_${caseId}`)
        .setLabel("Revoke")
        .setStyle(ButtonStyle.Danger)
    );

    // Get the moderation log channel
    const channel = (await container.client.channels.fetch(
      process.env.DISCORD_MOD_LOG_CHANNEL_ID
    )) as TextChannel;

    // Send the embed
    if (
      channel &&
      channel
        .permissionsFor(channel.guild.members.me)
        .has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])
    ) {
      user.send({
        embeds: [embed],
        content:
          "You have received a moderation action against you, if you believe this is a mistake please contact a staff member.",
      });

      const message = await channel.send({
        embeds: [embed],
        components: [row],
      });
      return await this.addModerationLog(caseId, message.id);
    }
  }

  public static async addModeration(
    user: string,
    moderator: string,
    type: ModerationType,
    reason: string,
    note: string
  ) {
    // Create the moderation log in the database
    const data = await container.db.moderation.create({
      data: {
        userId: user,
        moderatorId: moderator,
        type,
        reason,
        note,
      },
    });

    // Fetch the user and moderator
    const fetchedUser = await container.client.users.fetch(user);
    const fetchedModerator = await container.client.users.fetch(moderator);

    // Send the moderation log
    return this.sendModerationLog(
      data.id,
      fetchedUser,
      fetchedModerator,
      type,
      reason
    );
  }

  private static async addModerationLog(
    caseId: number,
    log: string
  ): Promise<void> {
    // Add the log to the moderation log in the database
    await container.db.moderation.update({
      where: { id: caseId },
      data: { logId: log },
    });
  }
}
