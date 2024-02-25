import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import {
  EmbedBuilder,
  type ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { servers } from "../../servers";

@ApplyOptions<Command.Options>({
  name: "leaderboard",
  description: "Check the leaderboard for this wipe kills",
})
export default class LeaderboardCommand extends Command {
  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const server = interaction.options.getString("server", true);
    const serverInfo = servers.find(
      (s) => s.ipAddress === server.split(":")[0]
    );

    if (!serverInfo) {
      return interaction.reply({
        content: "Invalid server",
        ephemeral: true,
      });
    }

    const leaderboard = await this.getLeaderboard(server, 25);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Kills Leaderboard | ${serverInfo?.name}`,
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setColor("#e615af")
      .setImage("https://i.imgur.com/ubWEkK6.gif")
      .setFooter({ text: "Showing Top 25 Players - This Wipe ONLY" })
      .setDescription(
        leaderboard
          .map((player) => {
            const kd =
              player.deaths === 0 ? player.kills : player.kills / player.deaths;

            return `#${player.rank}. **${player.id}** | ${
              player.kills
            } Kills | ${player.deaths} Deaths | ${kd.toFixed(2)} K/D`;
          })
          .join("\n")
      );

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`wipe_kills_${server}`)
        .setLabel("Wipe Player Kills (Admin Only)")
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [embed], components: [actionRow] });
  }

  private async getLeaderboard(serverId: string, limit: number) {
    const data = await this.container.db.player.findMany({
      where: {
        serverId,
      },
      orderBy: {
        kills: "desc",
      },
      take: limit,
    });

    if (!data.length) return [];

    return data.map((e, i) => ({ rank: i + 1, ...e }));
  }

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
              .setName("server")
              .setDescription("Which server to send the command to")
              .setRequired(true)
              .setAutocomplete(true)
          );
      },
      {
        idHints: [],
      }
    );
  }
}
