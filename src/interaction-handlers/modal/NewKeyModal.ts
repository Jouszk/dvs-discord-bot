import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ModalSubmitInteraction } from "discord.js";
import crypto from "crypto";

interface RedeemKey {
  key: string;
  commands: string[];
  name: string;
}

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class NewKeyModal extends InteractionHandler {
  public async parse(interaction: ModalSubmitInteraction) {
    if (!interaction.customId.startsWith("new_key_")) {
      return this.none();
    }

    return this.some(interaction.customId.split("_")[2]);
  }

  public async run(interaction: ModalSubmitInteraction, name: string) {
    // Get the content from the modal
    const commands = interaction.fields.getTextInputValue("key_commands");

    // Create the key
    const key = this.generateKey(12);

    const redeemKeys: RedeemKey[] = this.container.settings.get(
      "global",
      "keys",
      []
    );

    // Add the key to the list
    redeemKeys.push({
      key,
      commands: commands.split("\n"),
      name,
    });

    // Save the keys
    this.container.settings.set("global", "keys", redeemKeys);

    // Send Response
    interaction.reply({
      content: `The key \`${key}\` has been created for \`${name}\`!`,
      ephemeral: true,
    });

    return interaction.followUp({
      ephemeral: true,
      content: key,
    });
  }

  private generateKey(length: number) {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString("hex")
      .slice(0, length);
  }
}
