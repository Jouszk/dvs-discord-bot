import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { type AutocompleteInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Autocomplete,
})
export class ServerAutocomplete extends InteractionHandler {
  public async parse(interaction: AutocompleteInteraction) {
    if (
      ![
        "console",
        "cron",
        "cron_create",
        "cron_delete",
        "cron_view",
        "say",
        "leaderboard",
        "redeem",
        "stats",
      ].includes(interaction.commandName)
    ) {
      return this.none();
    }

    // Get the focused option
    const focused = interaction.options.getFocused(true);
    if (!focused || focused.name !== "server") {
      return this.none();
    }

    // Return the servers
    return this.some(
      this.container.servers
        .filter(
          (server) =>
            server.connected ||
            (server.limited && this.container.rce.limitedAuth)
        )
        .map((server) => ({
          name: `${server.name} ${server.limited ? "(Limited)" : ""}`,
          value: server.id,
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
