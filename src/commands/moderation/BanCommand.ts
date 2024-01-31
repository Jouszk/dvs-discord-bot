import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { ApplicationCommandType } from "discord-api-types/v10";

@ApplyOptions<Command.Options>({
  name: "Ban",
})
export class BanCommand extends Command {
  public async contextMenuRun(
    interaction: Command.ContextMenuCommandInteraction
  ) {
    // Fetch Members
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const target = await interaction.guild.members.fetch(interaction.targetId);

    // Check if the target is a bot
    if (target.user.bot) {
      return interaction.reply({
        content: "You cannot ban a bot.",
        ephemeral: true,
      });
    }

    // Check if the user is a moderator
    if (member.roles.highest.position <= target.roles.highest.position) {
      return interaction.reply({
        content: "You cannot ban this member due to role hierarchy.",
        ephemeral: true,
      });
    }

    // Create Modal
    const modal = new ModalBuilder()
      .setCustomId(`ban_${interaction.targetId}`)
      .setTitle(
        `Ban | ${
          target.user.discriminator === "0"
            ? target.user.username
            : target.user.tag
        }`
      )
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("ban_reason")
            .setLabel("Public Reason")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(10)
            .setMaxLength(250)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("ban_moderation_note")
            .setLabel("Moderation Note (Private)")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(500)
        )
      );

    // Send Modal
    return await interaction.showModal(modal);
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerContextMenuCommand(
      (c) => {
        c.setName(this.name.charAt(0).toUpperCase() + this.name.slice(1))
          .setType(ApplicationCommandType.User)
          .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);
      },
      {
        idHints: [],
      }
    );
  }
}
