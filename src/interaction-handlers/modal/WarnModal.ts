import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { User } from "discord.js";
import { ModalSubmitInteraction } from "discord.js";
import ModerationUtils, { ModerationType } from "../../util/ModerationUtils";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class WarnModal extends InteractionHandler {
  public async parse(interaction: ModalSubmitInteraction) {
    if (!interaction.customId.startsWith("warn_")) {
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
    const reason = interaction.fields.getTextInputValue("warn_reason");
    const note =
      interaction.fields.getTextInputValue("warn_moderation_note") || "None";

    // Warn the user
    await ModerationUtils.addModeration(
      user.id,
      interaction.user.id,
      ModerationType.Warn,
      reason,
      note
    );

    // Send success message
    return interaction.editReply({
      content: `Successfully warned ${user} (\`${user.id}\`)\n\nReason: ${reason}`,
    });
  }
}
