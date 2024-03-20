import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { type AutocompleteInteraction } from "discord.js";
import { VIP_PLANS } from "../../vars";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Autocomplete,
})
export class VIPPlanAutocomplete extends InteractionHandler {
  public async parse(interaction: AutocompleteInteraction) {
    if (!["vip", "vip_add"].includes(interaction.commandName)) {
      return this.none();
    }

    // Get the focused option
    const focused = interaction.options.getFocused(true);
    if (!focused || focused.name !== "plan") {
      return this.none();
    }

    // Return the plans
    return this.some(
      VIP_PLANS.map((plan) => ({
        name: plan.display,
        value: plan.value,
      })).slice(0, 25)
    );
  }

  public async run(
    interaction: AutocompleteInteraction,
    result: InteractionHandler.ParseResult<this>
  ) {
    return interaction.respond(result);
  }
}
