import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ButtonInteraction } from "discord.js";
import { Time } from "@sapphire/time-utilities";

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
      const flagged = this.container.settings.get("global", "flagged", []);
      if (flagged.includes(interaction.user.id)) {
        return await interaction.reply({
          content:
            "You are flagged and cannot access the server! Please contact a member of staff for more information.",
          ephemeral: true,
        });
      }

      // Check if the users account is older than 14 days
      if (Date.now() - interaction.user.createdTimestamp < Time.Day * 14) {
        flagged.push(interaction.user.id);
        this.container.settings.set("global", "flagged", flagged);

        return await interaction.reply({
          content:
            "You are flagged and cannot access the server! Please contact a member of staff for more information.",
          ephemeral: true,
        });
      }

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
