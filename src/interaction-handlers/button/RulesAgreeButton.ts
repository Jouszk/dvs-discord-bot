import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ButtonInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class RulesAgreeButton extends InteractionHandler {
  public async parse(interaction: ButtonInteraction) {
    return interaction.customId === "rules_agree" ? this.some() : this.none();
  }

  public async run(interaction: ButtonInteraction) {
    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (!member.roles.cache.has(process.env.DISCORD_MEMBER_ROLE_ID)) {
      await member.roles.add(process.env.DISCORD_MEMBER_ROLE_ID);

      return await interaction.reply({
        content: "You have been given access to the server!",
        ephemeral: true,
      });
    }

    return await interaction.reply({
      content: "You already have access to the server!",
      ephemeral: true,
    });
  }
}
