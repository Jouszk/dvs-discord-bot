import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ModalSubmitInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class TagCreateModal extends InteractionHandler {
  public async parse(interaction: ModalSubmitInteraction) {
    if (!interaction.customId.startsWith("tag_create_")) {
      return this.none();
    }

    return this.some(interaction.customId.split("_")[2]);
  }

  public async run(interaction: ModalSubmitInteraction, name: string) {
    // Get the content from the modal
    const content = interaction.fields.getTextInputValue("tag_content");
    const image = interaction.fields.getTextInputValue("tag_image") || null;

    // Create the tag
    await this.container.db.tag.create({
      data: {
        name,
        content,
        author: interaction.user.id,
        image,
      },
    });

    // Send Response
    return interaction.reply({
      content: `The tag \`${name}\` has been created.`,
      ephemeral: true,
    });
  }
}
