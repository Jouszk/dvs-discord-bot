import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ButtonInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class ViewModerationButton extends InteractionHandler {
  public async parse(interaction: ButtonInteraction) {
    return interaction.customId === "cancel_redeem" ? this.some() : this.none();
  }

  public async run(interaction: ButtonInteraction) {
    // Send a response
    return interaction.reply({
      content: "You have cancelled the redeem process.",
      ephemeral: true,
    });
  }
}
