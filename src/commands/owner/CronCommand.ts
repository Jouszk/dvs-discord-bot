import { Subcommand } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import {
  type ChatInputCommandInteraction,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
} from "discord.js";
import { CronTask } from "../../interfaces";

@ApplyOptions<Subcommand.Options>({
  name: "cron",
  description: "Manage cron tasks in the RCE server",
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
      name: "view",
      chatInputRun: "chatInputView",
    },
  ],
})
export default class CronCommand extends Subcommand {
  public override registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand(
      (command) => {
        command
          .setName(this.name)
          .setDescription(this.description)
          .addSubcommand((subCommand) =>
            subCommand
              .setName("create")
              .setDescription("Create a cron task")
              .addStringOption((option) =>
                option
                  .setName("name")
                  .setDescription("The name of the cron task")
                  .setRequired(true)
              )
              .addBooleanOption((option) =>
                option
                  .setName("permanent")
                  .setDescription("Whether the cron task should be permanent")
                  .setRequired(true)
              )
              .addStringOption((option) =>
                option
                  .setName("server")
                  .setDescription("Which server to send the command to")
                  .setRequired(true)
                  .setAutocomplete(true)
              )
          )
          .addSubcommand((subCommand) =>
            subCommand
              .setName("delete")
              .setDescription("Delete a cron task")
              .addStringOption((option) =>
                option
                  .setName("name")
                  .setDescription("The name of the cron task")
                  .setRequired(true)
                  .setAutocomplete(true)
              )
              .addStringOption((option) =>
                option
                  .setName("server")
                  .setDescription("Which server to send the command to")
                  .setRequired(true)
                  .setAutocomplete(true)
              )
          )
          .addSubcommand((subCommand) =>
            subCommand
              .setName("view")
              .setDescription("View a cron task")
              .addStringOption((option) =>
                option
                  .setName("server")
                  .setDescription("Which server to send the command to")
                  .setRequired(true)
                  .setAutocomplete(true)
              )
              .addStringOption((option) =>
                option
                  .setName("name")
                  .setDescription("The name of the cron task")
                  .setAutocomplete(true)
              )
          )
          .setDefaultMemberPermissions(0);
      },
      { idHints: [] }
    );
  }

  public async chatInputCreate(interaction: ChatInputCommandInteraction) {
    const name = interaction.options
      .getString("name", true)
      .toLowerCase()
      .replace(/ /g, "-");
    const permanent = interaction.options.getBoolean("permanent", true);
    const serverId = interaction.options.getString("server", true);

    // Check if the cron task already exists
    const crons: CronTask[] = this.container.settings.get(
      "global",
      "crons",
      []
    );
    const cron = crons.find(
      (cron) => cron.name === name && cron.serverId === serverId
    );

    if (cron) {
      return interaction.reply({
        content: `A cron task with the name \`${name}\` already exists for this server.`,
        ephemeral: true,
      });
    }

    // Create Modal
    const modal = new ModalBuilder()
      .setCustomId(`cron_create_${name}_${serverId}_${permanent}`)
      .setTitle("Create Cron Task")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("cron_time")
            .setLabel("Cron Time")
            .setPlaceholder("0 0 * * *")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(3)
            .setMaxLength(25)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("cron_commands")
            .setLabel("Cron Commands")
            .setPlaceholder("Separate commands with a new line")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(5)
            .setMaxLength(2000)
        )
      );

    // Send Modal
    return await interaction.showModal(modal);
  }

  public async chatInputDelete(interaction: ChatInputCommandInteraction) {
    const name = interaction.options
      .getString("name", true)
      .toLowerCase()
      .replace(/ /g, "-");
    const serverId = interaction.options.getString("server", true);

    // Check if the cron task exists
    const crons: CronTask[] = this.container.settings.get(
      "global",
      "crons",
      []
    );
    const cron = crons.find(
      (cron) => cron.name === name && cron.serverId === serverId
    );

    if (!cron) {
      return interaction.reply({
        content: `A cron task with the name \`${name}\` doesn't exist on this server.`,
        ephemeral: true,
      });
    }

    // Delete the cron task
    const index = crons.indexOf(cron);
    crons.splice(index, 1);
    this.container.settings.set("global", "crons", crons);

    // Send Response
    await interaction.reply({
      content: `The cron task \`${name}\` has been deleted for this server.`,
      ephemeral: true,
    });

    // Restart bot
    process.exit(0);
  }

  public async chatInputView(interaction: ChatInputCommandInteraction) {
    const name = interaction.options
      .getString("name")
      ?.toLowerCase()
      ?.replace(/ /g, "-");
    const serverId = interaction.options.getString("server", true);

    const crons: CronTask[] = this.container.settings.get(
      "global",
      "crons",
      []
    );

    // Send all cron tasks if no name is provided
    if (!name) {
      // Create an embed
      const embed = new EmbedBuilder()
        .setTitle("Cron Tasks")
        .setDescription(crons.map((cron) => `\`${cron.name}\``).join(", "))
        .setThumbnail(this.container.client.user.displayAvatarURL());

      // Send Response
      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }

    // Fetch the cron task if a name is provided
    const cron = crons.find(
      (cron) => cron.name === name && cron.serverId === serverId
    );

    // Check if the tag already exists
    if (!cron) {
      return interaction.reply({
        content: `A tag cron task the name \`${name}\` does not exist on this server.`,
        ephemeral: true,
      });
    }

    // Send Response
    return interaction.reply({
      content: `\`${cron.name}\` - \`${cron.time}\`\n\`\`\`${cron.commands}\`\`\``,
      ephemeral: true,
    });
  }
}
