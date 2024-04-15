import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ButtonInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class ToggleRoleButton extends InteractionHandler {
  public async parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("toggle_role")) {
      return this.none();
    }

    return this.some(interaction.customId.split("-")[1]);
  }

  public async run(interaction: ButtonInteraction, roleId: string) {
    const member = await interaction.guild!.members.fetch(interaction.user.id);
    const role = interaction.guild!.roles.cache.get(roleId);

    (await member.roles.cache.has(roleId))
      ? member.roles.remove(role!)
      : member.roles.add(role!);

    return interaction.reply({
      content: `Role **${role!.name}** ${
        member.roles.cache.has(roleId) ? "added" : "removed"
      }!`,
      ephemeral: true,
    });
  }
}
