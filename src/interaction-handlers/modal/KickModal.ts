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
export class KickModal extends InteractionHandler {
  public async parse(interaction: ModalSubmitInteraction) {
    if (!interaction.customId.startsWith("kick_")) {
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
    const reason = interaction.fields.getTextInputValue("kick_reason");
    const note =
      interaction.fields.getTextInputValue("kick_moderation_note") || "None";

    // Kick the user
    await ModerationUtils.addModeration(
      user.id,
      interaction.user.id,
      ModerationType.Kick,
      reason,
      note
    );

    await interaction.guild.members.kick(user, reason);

    // Send success message
    return interaction.editReply({
      content: `Successfully kicked ${user} (\`${user.id}\`)\n\nReason: ${reason}`,
    });
  }
}
