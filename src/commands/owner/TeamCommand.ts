import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  ColorResolvable,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "team",
  description: "View information about a team",
  preconditions: ["GameAdminOnly"],
})
export default class TeamCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand(
      (command) => {
        command
          .setName(this.name)
          .setDescription(this.description)
          .addNumberOption((option) =>
            option
              .setName("teamid")
              .setDescription("The ID of the team")
              .setRequired(true)
              .setMinValue(0)
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers);
      },
      {
        idHints: [],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const teamId = interaction.options.getNumber("teamid", true);

    // Retrieve the team
    const team = await this.container.db.gameTeam.findUnique({
      where: {
        teamId,
      },
    });

    if (!team) {
      return interaction.reply({
        ephemeral: true,
        content: "This team does not exist in the database",
      });
    }

    const embed = new EmbedBuilder()
      .setColor(process.env.DISCORD_BOT_THEME as ColorResolvable)
      .setImage(process.env.DISCORD_BOT_EMBED_FOOTER_URL)
      .setTitle(`Team ${team.teamId}`)
      .setFooter({ text: "Team Created" })
      .setTimestamp(team.createdAt)
      .addField(
        `Active Members [${team.activeMembers.length}]`,
        team.activeMembers.length ? team.activeMembers.join("\n") : "None",
        true
      )
      .addField(
        `Past Members [${team.pastMembers.length}]`,
        team.pastMembers.length ? team.pastMembers.join("\n") : "None",
        true
      );

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
}
