import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ButtonInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class GameAdminApplicationButton extends InteractionHandler {
  public async parse(interaction: ButtonInteraction) {
    return interaction.customId === "unlink_ign" ? this.some() : this.none();
  }

  public async run(interaction: ButtonInteraction) {
    const data = await this.container.db.linkedAccount.findFirst({
      where: {
        discordId: interaction.user.id,
      },
    });

    if (!data) {
      return interaction.reply({
        content:
          "Your Discord account is not linked to an in-game account, use the `/link` command to link your account",
        ephemeral: true,
      });
    }

    await this.container.db.linkedAccount.delete({
      where: {
        discordId: interaction.user.id,
      },
    });

    return interaction.reply({
      content:
        "Your in-game account has been unlinked from your Discord account",
      ephemeral: true,
    });
  }
}
