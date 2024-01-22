import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { type AutocompleteInteraction } from "discord.js";
import { keyPresets } from "../../keyPresets";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Autocomplete,
})
export class KeyPresetAutocomplete extends InteractionHandler {
  public async parse(interaction: AutocompleteInteraction) {
    if (interaction.commandName !== "new-key") {
      return this.none();
    }

    // Get the focused option
    const focused = interaction.options.getFocused(true);
    if (!focused || focused.name !== "key-preset") {
      return this.none();
    }

    console.log(focused);

    const presets = keyPresets.filter((preset) =>
      preset.name.toLowerCase().includes(focused.value.toLowerCase())
    );

    console.log(presets);

    // Return the presets
    return this.some(
      presets.map((preset) => ({ name: preset.name, value: preset.name }))
    );
  }

  public async run(
    interaction: AutocompleteInteraction,
    result: InteractionHandler.ParseResult<this>
  ) {
    return interaction.respond(result);
  }
}
