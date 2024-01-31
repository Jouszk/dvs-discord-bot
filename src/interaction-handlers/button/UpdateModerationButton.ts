import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import {
  ActionRowBuilder,
  ButtonInteraction,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { Moderation } from "@prisma/client";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button,
})
export class UpdateModerationButton extends InteractionHandler {
  public async parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("change_moderation_")) {
      return this.none();
    }

    // Fetch the member data
    const member = await interaction.guild.members.fetch(interaction.user.id);

    // If the member is not a moderator, return
    if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return this.none();
    }

    // Get the moderation data
    const data = await this.container.db.moderation.findFirst({
      where: {
        id: Number(interaction.customId.split("_")[2]),
      },
    });

    return this.some(data);
  }

  public async run(interaction: ButtonInteraction, data?: Moderation) {
    // If no data was found, return
    if (!data) {
      return interaction.reply({
        content: "No moderation data was found for this case.",
        ephemeral: true,
      });
    }

    // Get the user
    const target = await this.container.client.users.fetch(
      data.userId.toString()
    );

    // Create Modal
    const modal = new ModalBuilder()
      .setCustomId(`update_moderation_${data.id}`)
      .setTitle(
        `Update #${data.id} | ${
          target.discriminator === "0" ? target.username : target.tag
        }`
      )
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("new_reason")
            .setLabel("New Reason")
            .setValue(data.reason)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(10)
            .setMaxLength(250)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("new_moderation_note")
            .setLabel("Moderation Note (Private)")
            .setValue(data.note)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(500)
        )
      );

    // Send Modal
    return await interaction.showModal(modal);
  }
}
