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
export class BanModal extends InteractionHandler {
  public async parse(interaction: ModalSubmitInteraction) {
    if (!interaction.customId.startsWith("ban_")) {
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
    const reason = interaction.fields.getTextInputValue("ban_reason");
    const note =
      interaction.fields.getTextInputValue("ban_moderation_note") || "None";

    // Ban the user
    await ModerationUtils.addModeration(
      user.id,
      interaction.user.id,
      ModerationType.Ban,
      reason,
      note
    );

    await interaction.guild.members.ban(user, { reason });

    // Send success message
    return interaction.editReply({
      content: `Successfully banned ${user} (\`${user.id}\`)\n\nReason: ${reason}`,
    });
  }
}
