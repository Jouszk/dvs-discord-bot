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

interface Params {
  name: string;
  quantity: number;
}

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class NewKeyModal extends InteractionHandler {
  public async parse(interaction: ModalSubmitInteraction) {
    if (!interaction.customId.startsWith("new_key_")) {
      return this.none();
    }

    return this.some({
      quantity: parseInt(interaction.customId.split("_")[2]),
      name: interaction.customId.split("_")[3],
    });
  }

  public async run(interaction: ModalSubmitInteraction, params: Params) {
    // Temporary variable for keys
    const keys: string[] = [];

    // Get the content from the modal
    const commands = interaction.fields.getTextInputValue("key_commands");

    // Create the keys
    const redeemKeys: RedeemKey[] = this.container.settings.get(
      "global",
      "keys",
      []
    );

    // Add the key to the list
    for (let i = 0; i < params.quantity; i++) {
      const key = this.generateKey(12);

      redeemKeys.push({
        key,
        commands: commands.split("\n"),
        name: params.name,
      });

      keys.push(key);
    }

    // Save the keys
    this.container.settings.set("global", "keys", redeemKeys);

    // Send Response
    interaction.reply({
      content: keys.join("\n"),
      ephemeral: true,
    });
  }

  private generateKey(length: number) {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString("hex")
      .slice(0, length);
  }
}
