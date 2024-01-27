import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ModalSubmitInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class WipeKillsModal extends InteractionHandler {
  public async parse(interaction: ModalSubmitInteraction) {
    return interaction.customId === "wipe_kills" ? this.some() : this.none();
  }

  public async run(interaction: ModalSubmitInteraction) {
    // Get the content from the modal
    const inGameName = interaction.fields.getTextInputValue("in_game_name");

    // Get the player from the database
    const player = await this.container.db.player.findUnique({
      where: {
        id: inGameName,
      },
    });

    // If the player doesn't exist, return
    if (!player) return interaction.reply({ content: "Player not found" });

    // Update the player's kills to 0
    await this.container.db.player.update({
      where: {
        id: inGameName,
      },
      data: {
        kills: 0,
      },
    });

    // Reply to the interaction
    return interaction.reply({
      content: `Successfully wiped ${inGameName}'s kills`,
    });
  }
}
