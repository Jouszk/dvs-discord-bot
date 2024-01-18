import { Listener } from "@sapphire/framework";
import {
  EmbedBuilder,
  type GuildMember,
  TextChannel,
  PermissionFlagsBits,
  VoiceChannel,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Listener.Options>({
  name: "guildMemberRemove",
})
export default class MessageDeleteListener extends Listener {
  public async run(member: GuildMember) {
    // Member Log
    const channel = await this.getChannel<TextChannel>(
      process.env.DISCORD_MEMBER_LOG_CHANNEL_ID
    );

    if (
      channel &&
      channel
        .permissionsFor(member.guild.members.me)
        .has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])
    ) {
      const embed = new EmbedBuilder()
        .setTitle("Goodbye :(")
        .setDescription(`${member} (\`${member.id}\`) left the server.`)
        .setColor("#f44336")
        .setThumbnail(member.user.displayAvatarURL({ size: 512 }))
        .setFooter({ text: "Joined Server" })
        .setTimestamp(member.joinedAt);

      await channel.send({ embeds: [embed] });
    }

    // Member Count
    const memberCountChannel = await this.getChannel<VoiceChannel>(
      process.env.DISCORD_MEMBER_COUNT_CHANNEL_ID
    );

    if (
      memberCountChannel &&
      memberCountChannel
        .permissionsFor(member.guild.members.me)
        .has([PermissionFlagsBits.ManageChannels])
    ) {
      await memberCountChannel.setName(
        `Members: ${member.guild.members.cache.filter((m) => !m.user.bot).size}`
      );
    }
  }

  private async getChannel<T>(channelId: string): Promise<T> {
    return (await this.container.client.channels.fetch(channelId)) as T;
  }
}
