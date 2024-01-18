import { Listener } from "@sapphire/framework";
import {
  PermissionFlagsBits,
  EmbedBuilder,
  type Message,
  type TextChannel,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import StringUtils from "../../util/StringUtils";

@ApplyOptions<Listener.Options>({
  name: "messageDelete",
})
export default class MessageDeleteListener extends Listener {
  public async run(message: Message) {
    if (message.partial || message.author.bot) return;

    const channel = this.container.client.channels.cache.get(
      process.env.DISCORD_AUDIT_LOG_CHANNEL_ID
    ) as TextChannel;

    if (
      channel &&
      channel
        .permissionsFor(message.guild.members.me)
        .has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])
    ) {
      const embed = new EmbedBuilder()
        .setColor("#e74c3c")
        .setAuthor({
          name: `${message.author.tag} (${message.author.id})`,
          iconURL: message.author.displayAvatarURL({ size: 512 }),
        })
        .setDescription(StringUtils.smartTrim(message.content, 2000))
        .setThumbnail(message.author.displayAvatarURL({ size: 2048 }))
        .setFooter({
          text: "Message Deleted",
        })
        .addField(
          "Channel",
          `${message.channel} (\`${message.channel.id}\`)`,
          true
        )
        .setTimestamp();

      if (message.reference) {
        const referencedMessage = await message.channel.messages.fetch(
          message.reference.messageId
        );

        if (referencedMessage) {
          embed.addField(
            "Replied To",
            `[Jump to Message](${referencedMessage.url})`,
            true
          );
        }
      }

      if (message.attachments.size > 0) {
        embed.addField(
          "Attachments",
          message.attachments
            .map((attachment) => `[${attachment.name}](${attachment.url})`)
            .join("\n")
        );
      }

      await channel.send({ embeds: [embed] });
    }
  }
}
