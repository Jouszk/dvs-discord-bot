import { Precondition } from "@sapphire/framework";
import {
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";

export default class CommandChannelOnlyPrecondition extends Precondition {
  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (member.permissions.has(PermissionFlagsBits.Administrator)) {
      return this.ok();
    }

    return interaction.channel.id === process.env.COMMAND_CHANNEL
      ? this.ok()
      : this.error({
          message: `You can only use this command in <#${process.env.COMMAND_CHANNEL}>`,
        });
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    CommandChannelOnly: never;
  }
}
