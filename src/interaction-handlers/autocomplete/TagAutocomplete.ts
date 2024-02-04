import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { type AutocompleteInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Autocomplete,
})
export class TagEditModal extends InteractionHandler {
  public async parse(interaction: AutocompleteInteraction) {
    if (
      !["tag", "tag_create", "tag_edit", "tag_view"].includes(
        interaction.commandName
      )
    ) {
      return this.none();
    }

    // Get the focused option
    const focused = interaction.options.getFocused(true);
    if (!focused || focused.name !== "name") {
      return this.none();
    }

    // Get all tags from the database which include the focused value
    const tags = await this.container.db.tag.findMany({
      where: {
        name: {
          contains: focused.value,
        },
      },
    });

    // Return the tags
    return this.some(
      tags.map((tag) => ({ name: tag.name, value: tag.name })).slice(0, 25)
    );
  }

  public async run(
    interaction: AutocompleteInteraction,
    result: InteractionHandler.ParseResult<this>
  ) {
    return interaction.respond(result);
  }
}
