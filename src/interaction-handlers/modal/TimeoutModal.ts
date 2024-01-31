import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { User } from "discord.js";
import { ModalSubmitInteraction } from "discord.js";
import ModerationUtils, { ModerationType } from "../../util/ModerationUtils";
import ms from "ms";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class TimeoutModal extends InteractionHandler {
  public async parse(interaction: ModalSubmitInteraction) {
    if (!interaction.customId.startsWith("timeout_")) {
      return this.none();
    }

    const user = await this.container.client.users.fetch(
      interaction.customId.split("_")[1]
    );

    return this.some(user);
  }

  public async run(interaction: ModalSubmitInteraction, user: User) {
    await interaction.deferReply({ ephemeral: true });

    // Get values from modal
    const reason = interaction.fields.getTextInputValue("timeout_reason");
    const note =
      interaction.fields.getTextInputValue("timeout_moderation_note") || "None";
    const duration =
      interaction.fields.getTextInputValue("timeout_duration") || "1h";

    // Get the duration in milliseconds
    let durationMs = ms(duration) || ms("1h");

    // Make sure the duration is not longer than 28 days
    if (durationMs > ms("28d")) durationMs = ms("28d");

    // Timeout the user
    await ModerationUtils.addModeration(
      user.id,
      interaction.user.id,
      ModerationType.Timeout,
      reason,
      note
    );

    const member = await interaction.guild.members.fetch(user.id);
    await member.timeout(durationMs, reason);

    // Send success message
    return interaction.editReply({
      content: `Successfully timed-out ${user} (\`${
        user.id
      }\`)\n\nDuration: ${ms(durationMs)}\nReason: ${reason}`,
    });
  }
}
