import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import {
  ButtonInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { Moderation } from "@prisma/client";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class RevokeModerationButton extends InteractionHandler {
  public async parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("delete_moderation_")) {
      return this.none();
    }

    // Fetch the member data
    const member = await interaction.guild.members.fetch(interaction.user.id);

    // If the member is not a moderator, return
    if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
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

    // Get the moderation log channel
    const channel = this.container.client.channels.cache.get(
      process.env.DISCORD_MOD_LOG_CHANNEL_ID
    ) as TextChannel;

    // Fetch the message
    const msg = await channel.messages.fetch(data.logId.toString());

    // Delete the message
    await msg.delete();

    // Revoke the moderation
    await this.container.db.moderation.delete({
      where: {
        id: data.id,
      },
    });

    // Reply to the interaction
    return interaction.reply({
      content: `Successfully revoked case #${data.id} | ${user} (\`${user.id}\`)`,
      ephemeral: true,
    });
  }
}
