import { Subcommand } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ColorResolvable,
  User,
} from "discord.js";

const plans = {
  VIP_BASIC: "VIP Basic",
  VIP_PLUS: "VIP Plus",
};

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
                  .setAutocomplete(true)
              )
              .addNumberOption((option) =>
                option
                  .setName("days")
                  .setDescription("How many days of VIP to add")
                  .setRequired(false)
                  .setMinValue(-365)
                  .setMaxValue(365)
              )
              .addStringOption((option) =>
                option
                  .setName("chat-color")
                  .setDescription("The chat color of the VIP")
                  .setRequired(false)
              )
              .addStringOption((option) =>
                option
                  .setName("plan")
                  .setDescription(
                    "The VIP plan of the VIP (Default: VIP_BASIC)"
                  )
                  .setRequired(false)
                  .setAutocomplete(true)
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
          .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers);
      },
      { idHints: [] }
    );
  }

  public async chatInputAdd(interaction: ChatInputCommandInteraction) {
    const inGameName = interaction.options.getString("ign", true);
    const duration = interaction.options.getNumber("days", false);
    const chatColor = interaction.options.getString("chat-color", false);
    const plan = interaction.options.getString("plan", false);

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
        chatColor,
        plan
      );

      return interaction.reply({
        ephemeral: true,
        content: `Updated VIP: **${inGameName}**`,
      });
    } else {
      this.container.vipManager.addVIP(inGameName, duration, chatColor, plan);

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

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `VIP | ${vip.id}`,
        iconURL: interaction.guild.iconURL(),
      })
      .setColor(vip.chatColor as ColorResolvable)
      .addField("Expires At", new Date(vip.expiresAt).toLocaleString(), true)
      .addField("Plan", plans[vip.plan], true);

    return interaction.reply({
      embeds: [embed],
    });
  }
}
