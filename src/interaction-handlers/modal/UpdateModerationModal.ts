import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ModalSubmitInteraction, TextChannel } from "discord.js";
import { Moderation } from "@prisma/client";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class UpdateModerationModal extends InteractionHandler {
  public async parse(interaction: ModalSubmitInteraction) {
    if (!interaction.customId.startsWith("update_moderation_")) {
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

  public async run(interaction: ModalSubmitInteraction, data?: Moderation) {
    // If no data was found, return
    if (!data) {
      return interaction.reply({
        content: "No moderation data was found for this case.",
        ephemeral: true,
      });
    }

    // Get the user
    const target = await this.container.client.users.fetch(
      data.userId.toString()
    );

    // Get values from the modal
    const reason = interaction.fields.getTextInputValue("new_reason");
    const moderatorNote = interaction.fields.getTextInputValue(
      "new_moderation_note"
    );

    // Update the moderation
    await this.container.db.moderation.update({
      where: {
        id: data.id,
      },
      data: {
        reason,
        note: moderatorNote,
      },
    });

    // Get the moderation log channel
    const channel = this.container.client.channels.cache.get(
      process.env.DISCORD_MOD_LOG_CHANNEL_ID
    ) as TextChannel;

    // Fetch the message
    const msg = await channel.messages.fetch(data.logId.toString());

    // Update the reason field on the embed
    msg.embeds[0].fields[2].value = reason;

    // Edit the message
    await msg.edit({
      embeds: [msg.embeds[0]],
    });

    // Reply to the interaction
    return interaction.reply({
      content: `Successfully updated case #${data.id} | ${target} (\`${target.id}\`)`,
      ephemeral: true,
    });
  }
}
