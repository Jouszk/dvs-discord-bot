import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import {
  ButtonInteraction,
  ColorResolvable,
  EmbedBuilder,
  PermissionFlagsBits,
  time,
} from "discord.js";
import { Moderation } from "@prisma/client";
import {
  embedColor,
  embedEmoji,
  moderationType,
} from "../../util/ModerationUtils";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class ViewModerationButton extends InteractionHandler {
  public async parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("view_moderation_")) {
      return this.none();
    }

    // Fetch the member data
    const member = await interaction.guild.members.fetch(interaction.user.id);

    // If the member is not a moderator, return
    if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return this.none();
    }

    // Get the moderation data
    const data = await this.container.db.moderation.findFirst({
      where: {
        id: Number(interaction.customId.split("_")[2]),
      },
    });

    return this.some(data);
  }

  public async run(interaction: ButtonInteraction, data?: Moderation) {
    // If no data was found, return
    if (!data) {
      return interaction.reply({
        content: "No moderation data was found for this case.",
        ephemeral: true,
      });
    }

    // Get the user and moderator
    const user = await this.container.client.users.fetch(
      data.userId.toString()
    );
    const moderator = await this.container.client.users.fetch(
      data.moderatorId.toString()
    );

    // Create the embed
    const embed = new EmbedBuilder()
      .setTitle(
        `Case #${data.id} | ${
          user.discriminator === "0" ? user.username : user.tag
        }`
      )
      .setThumbnail(user.displayAvatarURL())
      .addField("Moderator", `${moderator} (\`${moderator.id}\`)`, true)
      .addField("User", `${user} (\`${user.id}\`)`, true)
      .addBlankField(true)
      .addField(
        "Issued",
        `${time(data.createdAt, "F")} (${time(data.createdAt, "R")})`,
        true
      )
      .addField(
        "Type",
        `${embedEmoji[data.type]} ${moderationType[data.type]}`,
        true
      )
      .addField("Reason", data.reason)
      .addField("Moderator Note", data.note || "No note provided.")
      .setColor(embedColor[data.type] as ColorResolvable)
      .setImage(process.env.DISCORD_BOT_EMBED_FOOTER_URL);

    // Send the embed
    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
