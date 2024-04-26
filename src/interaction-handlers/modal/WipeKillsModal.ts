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
    if (!interaction.customId.startsWith("wipe_kills_")) {
      return this.none();
    }

    return this.some(interaction.customId.split("_")[2]);
  }

  public async run(interaction: ModalSubmitInteraction, serverId: string) {
    // Get the content from the modal
    const inGameName = interaction.fields.getTextInputValue("in_game_name");

    // Get the player from the database
    const player = await this.container.db.player.findUnique({
      where: {
        id_serverId: {
          id: inGameName,
          serverId,
        },
      },
    });

    // If the player doesn't exist, return
    if (!player) return interaction.reply({ content: "Player not found" });

    // Update the player's kills to 0
    await this.container.db.player.update({
      where: {
        id_serverId: {
          id: inGameName,
          serverId,
        },
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
