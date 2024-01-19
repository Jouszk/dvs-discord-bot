import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ButtonInteraction } from "discord.js";
import TicketManager from "../../util/TicketManager";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class GameAdminApplicationButton extends InteractionHandler {
  public async parse(interaction: ButtonInteraction) {
    return interaction.customId === "close_ticket" ? this.some() : this.none();
  }

  public async run(interaction: ButtonInteraction) {
    await interaction.reply({ content: "Closing ticket...", ephemeral: true });

    await TicketManager.closeTicket(interaction.channelId);
  }
}
