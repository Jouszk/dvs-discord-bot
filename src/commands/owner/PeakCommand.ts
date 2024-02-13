import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  ColorResolvable,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { stripIndents } from "common-tags";

@ApplyOptions<Command.Options>({
  name: "peak",
  description: "Peak a players teaming history",
  preconditions: ["GameAdminOnly"],
})
export default class PeakCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand(
      (command) => {
        command
          .setName(this.name)
          .setDescription(this.description)
          .addStringOption((option) =>
            option
              .setName("ign")
              .setDescription("The in-game name of the player")
              .setRequired(true)
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers);
      },
      {
        idHints: [],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const ign = interaction.options.getString("ign", true);

    // Retrieve the associated teams for the player
    const teams = await this.container.db.gameTeam.findMany({
      where: {
        OR: [
          {
            activeMembers: {
              has: ign,
            },
          },
          {
            pastMembers: {
              has: ign,
            },
          },
        ],
      },
    });

    // If the player has no teams, return
    if (!teams.length) {
      return interaction.reply({
        ephemeral: true,
        content: `**${ign}** has no team history this wipe.`,
      });
    }

    // Get the current team
    const currentTeam = teams.find((team) => team.activeMembers.includes(ign));

    // Get the past teams
    const pastTeams = teams
      .filter((team) => team.pastMembers.includes(ign))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20);

    // Get an array of all associated ign's for the player
    const ignList = teams.reduce((acc, team) => {
      if (team.activeMembers.includes(ign)) {
        acc.push(...team.activeMembers);
      }
      if (team.pastMembers.includes(ign)) {
        acc.push(...team.pastMembers);
      }
      return acc;
    }, [] as string[]);
    const associatedIgns = [...new Set(ignList)];

    // Create an embed
    const embed = new EmbedBuilder()
      .setColor(process.env.DISCORD_BOT_THEME as ColorResolvable)
      .setImage(process.env.DISCORD_BOT_EMBED_FOOTER_URL)
      .setTitle(`Team History | ${ign}`)
      .addField(
        `Current Team (${currentTeam?.teamId || "0"})`,
        stripIndents`
        Created: \`${currentTeam?.createdAt.toLocaleString() || "None"}\`
        Members:
        ${
          currentTeam?.activeMembers.map((m) => `\`${m}\``).join("\n") ||
          "`None`"
        }

        Past Members:
        ${
          currentTeam?.pastMembers.map((m) => `\`${m}\``).join("\n") || "`None`"
        }
      `
      )
      .addField(
        `Past Teams (${pastTeams.length})`,
        pastTeams.length
          ? stripIndents`
        ${pastTeams
          .map((team) => {
            return stripIndents`
            ID: \`${team.teamId}\`
            Members: \`${team.activeMembers.length}\`
            Past Members: \`${team.pastMembers.length}\`
          `;
          })
          .join("\n\n")}
      `
          : "`None`"
      )
      .addField(
        "Associated Players",
        associatedIgns.map((m) => `\`${m}\``).join(", ")
      );

    // Send the embed
    return interaction.reply({
      ephemeral: true,
      embeds: [embed],
    });
  }
}
