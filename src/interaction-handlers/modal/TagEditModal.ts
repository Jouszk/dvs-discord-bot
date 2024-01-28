import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ModalSubmitInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class TagEditModal extends InteractionHandler {
  public async parse(interaction: ModalSubmitInteraction) {
    if (!interaction.customId.startsWith("tag_edit_")) {
      return this.none();
    }

    return this.some(interaction.customId.split("_")[2]);
  }

  public async run(interaction: ModalSubmitInteraction, name: string) {
    // Get the content from the modal
    const content = interaction.fields.getTextInputValue("tag_content");
    const image = interaction.fields.getTextInputValue("tag_image") || null;

    // Create the tag
    await this.container.db.tag.update({
      where: {
        name,
      },
      data: {
        content,
        image,
      },
    });

    // Send Response
    return interaction.reply({
      content: `The tag \`${name}\` has been edited.`,
      ephemeral: true,
    });
  }
}
