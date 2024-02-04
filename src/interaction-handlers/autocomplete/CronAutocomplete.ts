import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { type AutocompleteInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Autocomplete,
})
export class CronAutocomplete extends InteractionHandler {
  public async parse(interaction: AutocompleteInteraction) {
    if (
      !["cron", "cron_create", "cron_view"].includes(interaction.commandName)
    ) {
      return this.none();
    }

    // Get the focused option
    const focused = interaction.options.getFocused(true);
    if (!focused || focused.name !== "name") {
      return this.none();
    }

    // Get all crons from the database which include the focused value
    const crons = this.container.settings.get("global", "crons", []);
    const cronTasks = crons.filter((cron) =>
      cron.name.toLowerCase().includes(focused.value.toLowerCase())
    );

    // Return the tags
    return this.some(
      cronTasks
        .map((cronTask) => ({
          name: cronTask.name,
          value: cronTask.name,
        }))
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
