import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import {
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
} from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class WipeKillsButton extends InteractionHandler {
  public async parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("wipe_kills_")) {
      return this.none();
    }

    const member = interaction.guild.members.cache.get(interaction.user.id);

    return member.permissions.has(PermissionFlagsBits.Administrator)
      ? this.some(interaction.customId.split("_")[2])
      : this.none();
  }

  public async run(interaction: ButtonInteraction, serverId: string) {
    const modal = new ModalBuilder()
      .setCustomId(`wipe_kills_${serverId}`)
      .setTitle("Wipe Player Kills")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("in_game_name")
            .setLabel("What is their Xbox / PSN Username?")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(3)
            .setMaxLength(25)
        )
      );

    return await interaction.showModal(modal);
  }
}
