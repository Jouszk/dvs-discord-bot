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
  name: "messageUpdate",
})
export default class MessageUpdateListener extends Listener {
  public async run(oldMessage: Message, newMessage: Message) {
    if (newMessage.partial || newMessage.author.bot) return;
    if (!oldMessage.content || !newMessage.content) return;
    if (oldMessage.content === newMessage.content) return;

    const channel = this.container.client.channels.cache.get(
      process.env.DISCORD_AUDIT_LOG_CHANNEL_ID
    ) as TextChannel;

    if (
      channel &&
      channel
        .permissionsFor(newMessage.guild.members.me)
        .has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])
    ) {
      const embed = new EmbedBuilder()
        .setColor("#f1c40f")
        .setAuthor({
          name: `${newMessage.author.tag} (${newMessage.author.id})`,
          iconURL: newMessage.author.displayAvatarURL({ size: 512 }),
        })
        .setThumbnail(newMessage.author.displayAvatarURL({ size: 2048 }))
        .setFooter({
          text: "Message Updated",
        })
        .addField(
          "Old Content",
          StringUtils.smartTrim(oldMessage.content, 1024)
        )
        .addField(
          "New Content",
          StringUtils.smartTrim(newMessage.content, 1024)
        )
        .addField("Jump", `[Jump to Message](${newMessage.url})`)
        .addField(
          "Channel",
          `${newMessage.channel} (\`${newMessage.channel.id}\`)`,
          true
        )
        .setTimestamp();

      if (newMessage.reference) {
        const referencedMessage = await newMessage.channel.messages.fetch(
          newMessage.reference.messageId
        );

        if (referencedMessage) {
          embed.addField(
            "Replied To",
            `[Jump to Message](${referencedMessage.url})`,
            true
          );
        }
      }

      await channel.send({ embeds: [embed] });
    }
  }
}
