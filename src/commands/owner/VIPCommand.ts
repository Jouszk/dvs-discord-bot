import { Subcommand } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ColorResolvable,
} from "discord.js";

@ApplyOptions<Subcommand.Options>({
  name: "vip",
  description: "Manage VIPs",
  preconditions: ["GameAdminOnly"],
  subcommands: [
    {
      name: "add",
      chatInputRun: "chatInputAdd",
    },
    {
      name: "delete",
      chatInputRun: "chatInputDelete",
    },
    {
      name: "view",
      chatInputRun: "chatInputView",
    },
    {
      name: "list",
      chatInputRun: "chatInputList",
    },
  ],
})
export default class VIPCommand extends Subcommand {
  public override registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand(
      (command) => {
        command
          .setName(this.name)
          .setDescription(this.description)
          .addSubcommand((subCommand) =>
            subCommand
              .setName("add")
              .setDescription("Add a new VIP")
              .addStringOption((option) =>
                option
                  .setName("ign")
                  .setDescription("The in-game name of the VIP")
                  .setRequired(true)
              )
              .addNumberOption((option) =>
                option
                  .setName("days")
                  .setDescription("How many days of VIP to add")
                  .setRequired(false)
                  .setMinValue(-365)
                  .setMaxValue(365)
              )
              .addUserOption((option) =>
                option
                  .setName("discord")
                  .setDescription("The Discord user of the VIP")
                  .setRequired(false)
              )
              .addStringOption((option) =>
                option
                  .setName("chat-color")
                  .setDescription("The chat color of the VIP")
                  .setRequired(false)
              )
          )
          .addSubcommand((subCommand) =>
            subCommand
              .setName("delete")
              .setDescription("Delete an existing VIP")
              .addStringOption((option) =>
                option
                  .setName("ign")
                  .setDescription("The in-game name of the VIP")
                  .setRequired(true)
                  .setAutocomplete(true)
              )
          )
          .addSubcommand((subCommand) =>
            subCommand
              .setName("view")
              .setDescription("View an existing VIP")
              .addStringOption((option) =>
                option
                  .setName("ign")
                  .setDescription("The in-game name of the VIP")
                  .setAutocomplete(true)
                  .setRequired(true)
              )
          )
          .addSubcommand((subCommand) =>
            subCommand
              .setName("list")
              .setDescription("List all VIPs")
              .addNumberOption((option) =>
                option
                  .setName("page")
                  .setDescription("The page number")
                  .setRequired(false)
              )
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers);
      },
      { idHints: [] }
    );
  }

  public async chatInputAdd(interaction: ChatInputCommandInteraction) {
    const inGameName = interaction.options.getString("ign", true);
    const duration = interaction.options.getNumber("days", false);
    const discordId = interaction.options.getUser("discord", false)?.id;
    const chatColor = interaction.options.getString("chat-color", false);

    // Check if chatColor is a valid hex color including the hashtag in a six digit format
    if (chatColor && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(chatColor)) {
      return interaction.reply({
        ephemeral: true,
        content: "You provided an invalid color hex code",
      });
    }

    const existingVip = this.container.vipManager.getVIP(inGameName);

    if (existingVip) {
      this.container.vipManager.updateVIP(
        inGameName,
        duration,
        discordId,
        chatColor
      );

      return interaction.reply({
        ephemeral: true,
        content: `Updated VIP: **${inGameName}**`,
      });
    } else {
      this.container.vipManager.addVIP(
        inGameName,
        duration,
        discordId,
        chatColor
      );

      return interaction.reply({
        ephemeral: true,
        content: `Added VIP: **${inGameName}**`,
      });
    }
  }

  public async chatInputDelete(interaction: ChatInputCommandInteraction) {
    const inGameName = interaction.options.getString("ign", true);
    const vip = this.container.vipManager.getVIP(inGameName);

    if (!vip) {
      return interaction.reply({
        ephemeral: true,
        content: `No VIP found with in-game name: **${inGameName}**`,
      });
    }

    this.container.vipManager.expireVIP(vip);

    return interaction.reply({
      ephemeral: true,
      content: `Deleted VIP: **${inGameName}**`,
    });
  }

  public async chatInputView(interaction: ChatInputCommandInteraction) {
    const inGameName = interaction.options.getString("ign", true);
    const vip = this.container.vipManager.getVIP(inGameName);

    if (!vip) {
      return interaction.reply({
        ephemeral: true,
        content: `No VIP found with in-game name: **${inGameName}**`,
      });
    }

    return interaction.reply({
      ephemeral: true,
      content: `**${vip.id}**\nDiscord: ${
        vip.discordId ? `<@${vip.discordId}>` : "None"
      }\nExpires at: ${new Date(vip.expiresAt).toLocaleString()}\nChat Color: ${
        vip.chatColor
      }`,
    });
  }

  public async chatInputList(interaction: ChatInputCommandInteraction) {
    const vipList = this.container.vipManager.listVIPs();

    if (!vipList.length) {
      return interaction.reply({
        ephemeral: true,
        content: "No VIPs found",
      });
    }

    let page = interaction.options.getNumber("page", false) || 1;

    const pages = Math.ceil(vipList.length / 10);
    if (page > pages) page = 1;
    const vipPage = vipList.slice((page - 1) * 10, page * 10);

    const embed = new EmbedBuilder()
      .setColor(process.env.DISCORD_BOT_THEME as ColorResolvable)
      .setTitle("VIP List")
      .setDescription(
        vipPage
          .map((vip) => {
            return `**${vip.id}**\nDiscord: ${
              vip.discordId ? `<@${vip.discordId}>` : "None"
            }\nExpires at: ${new Date(vip.expiresAt).toLocaleString()}`;
          })
          .join("\n\n")
      )
      .setImage(process.env.DISCORD_BOT_EMBED_FOOTER_URL)
      .setFooter({ text: `Page ${page} of ${pages}` });

    return interaction.reply({
      ephemeral: true,
      embeds: [embed],
    });
  }
}
