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
    return interaction.customId === "tag_create" ? this.some() : this.none();
  }

  public async run(interaction: ModalSubmitInteraction) {
    // Get the content from the modal
    const name = interaction.fields.getTextInputValue("tag_name");
    const content = interaction.fields.getTextInputValue("tag_content");
    const image = interaction.fields.getTextInputValue("tag_image") || null;

    // Check if the tag already exists
    const tag = await this.container.db.tag.findFirst({
      where: {
        name,
      },
    });

    if (tag) {
      return interaction.reply({
        content: `A tag with the name \`${name}\` already exists.`,
        ephemeral: true,
      });
    }

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
