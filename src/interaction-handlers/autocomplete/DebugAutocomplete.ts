import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { type AutocompleteInteraction } from "discord.js";
import { items } from "../../items";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Autocomplete,
})
export class DebugAutocomplete extends InteractionHandler {
  public async parse(interaction: AutocompleteInteraction) {
    if (interaction.commandName !== "debug") {
      return this.none();
    }

    // Get the focused option
    const focused = interaction.options.getFocused(true);
    if (!focused || !["item1", "item2", "item3"].includes(focused.name)) {
      return this.none();
    }

    const presets = items.filter((item) =>
      item.displayName.toLowerCase().includes(focused.value.toLowerCase())
    );

    // Return the presets
    return this.some(
      presets
        .map((item) => ({ name: item.displayName, value: item.shortName }))
        .slice(0, 25)
    );
  }

  public async run(
    interaction: AutocompleteInteraction,
    result: InteractionHandler.ParseResult<this>
  ) {
    return interaction.respond(result);
  }
}
