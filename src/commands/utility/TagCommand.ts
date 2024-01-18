import { Subcommand } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import {
  type ChatInputCommandInteraction,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

@ApplyOptions<Subcommand.Options>({
  name: "tag",
  description: "Manage tags",
  subcommands: [
    {
      name: "create",
      chatInputRun: "chatInputCreate",
    },
    {
      name: "delete",
      chatInputRun: "chatInputDelete",
    },
    {
      name: "edit",
      chatInputRun: "chatInputEdit",
    },
    {
      name: "view",
      chatInputRun: "chatInputView",
    },
  ],
})
export default class TagCommand extends Subcommand {
  public override registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand(
      (command) => {
        command
          .setName(this.name)
          .setDescription(this.description)
          .addSubcommand((subCommand) =>
            subCommand
              .setName("create")
              .setDescription("Create a tag")
              .addStringOption((option) =>
                option
                  .setName("name")
                  .setDescription("The name of the tag")
                  .setRequired(true)
              )
          )
          .addSubcommand((subCommand) =>
            subCommand
              .setName("delete")
              .setDescription("Delete a tag")
              .addStringOption((option) =>
                option
                  .setName("name")
                  .setDescription("The name of the tag")
                  .setRequired(true)
                  .setAutocomplete(true)
              )
          )
          .addSubcommand((subCommand) =>
            subCommand
              .setName("edit")
              .setDescription("Edit a tag")
              .addStringOption((option) =>
                option
                  .setName("name")
                  .setDescription("The name of the tag")
                  .setRequired(true)
                  .setAutocomplete(true)
              )
          )
          .addSubcommand((subCommand) =>
            subCommand
              .setName("view")
              .setDescription("View a tag")
              .addStringOption((option) =>
                option
                  .setName("name")
                  .setDescription("The name of the tag")
                  .setAutocomplete(true)
              )
          );
      },
      { idHints: [] }
    );
  }

  public async chatInputCreate(interaction: ChatInputCommandInteraction) {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const name = interaction.options
      .getString("name", true)
      .toLowerCase()
      .replace(/ /g, "-");

    // Only allow admins to create tags
    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "You do not have permission to create tags.",
        ephemeral: true,
      });
    }

    const tag = await this.container.db.tag.findFirst({
      where: {
        name,
      },
    });

    // Check if the tag already exists
    if (tag) {
      return interaction.reply({
        content: `A tag with the name \`${name}\` already exists.`,
        ephemeral: true,
      });
    }

    // Create Modal
    const modal = new ModalBuilder()
      .setCustomId(`tag_create_${name}`)
      .setTitle("Tag Creation")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("tag_content")
            .setLabel("Content")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(10)
            .setMaxLength(4000)
        )
      );

    // Send Modal
    return await interaction.showModal(modal);
  }

  public async chatInputDelete(interaction: ChatInputCommandInteraction) {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const name = interaction.options
      .getString("name", true)
      .toLowerCase()
      .replace(/ /g, "-");

    const tag = await this.container.db.tag.findFirst({
      where: {
        name,
      },
    });

    // Check if the tag already exists
    if (!tag) {
      return interaction.reply({
        content: `A tag with the name \`${name}\` does not exist.`,
        ephemeral: true,
      });
    }

    // Check if the user is the owner of the tag or a moderator
    if (
      tag.author !== interaction.user.id &&
      !member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: `You do not have permission to delete the tag \`${name}\`.`,
        ephemeral: true,
      });
    }

    // Delete the tag
    await this.container.db.tag.delete({
      where: {
        name,
      },
    });

    // Send Response
    return interaction.reply({
      content: `The tag \`${name}\` has been deleted.`,
      ephemeral: true,
    });
  }

  public async chatInputEdit(interaction: ChatInputCommandInteraction) {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const name = interaction.options
      .getString("name", true)
      .toLowerCase()
      .replace(/ /g, "-");

    const tag = await this.container.db.tag.findFirst({
      where: {
        name,
      },
    });

    // Check if the tag already exists
    if (!tag) {
      return interaction.reply({
        content: `A tag with the name \`${name}\` does not exist.`,
        ephemeral: true,
      });
    }

    // Check if the user is the owner of the tag or a moderator
    if (
      tag.author !== interaction.user.id &&
      !member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: `You do not have permission to edit the tag \`${name}\`.`,
        ephemeral: true,
      });
    }

    // Create Modal
    const modal = new ModalBuilder()
      .setCustomId(`tag_edit_${name}`)
      .setTitle("Tag Edit")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("tag_content")
            .setLabel("Content")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(10)
            .setMaxLength(4000)
            .setValue(tag.content)
        )
      );

    // Send Modal
    return await interaction.showModal(modal);
  }

  public async chatInputView(interaction: ChatInputCommandInteraction) {
    const name = interaction.options
      .getString("name")
      ?.toLowerCase()
      ?.replace(/ /g, "-");

    // Send all tags if no name is provided
    if (!name) {
      const tags = await this.container.db.tag.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

      // Create an embed
      const embed = new EmbedBuilder()
        .setTitle("Tags")
        .setDescription(tags.map((tag) => `\`${tag.name}\``).join(", "))
        .setThumbnail(this.container.client.user.displayAvatarURL());

      // Send Response
      return interaction.reply({
        embeds: [embed],
      });
    }

    // Fetch the tag if a name is provided
    const tag = await this.container.db.tag.findFirst({
      where: {
        name,
      },
    });

    // Check if the tag already exists
    if (!tag) {
      return interaction.reply({
        content: `A tag with the name \`${name}\` does not exist.`,
        ephemeral: true,
      });
    }

    // Send Response
    return interaction.reply({
      content: tag.content,
    });
  }
}
