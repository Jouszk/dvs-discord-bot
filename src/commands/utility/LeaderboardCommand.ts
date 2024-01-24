import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import { EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Player } from "@prisma/client";

@ApplyOptions<Command.Options>({
  name: "leaderboard",
  description: "Check the leaderboard for this wipe kills",
})
export default class LeaderboardCommand extends Command {
  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const leaderboard = await this.getLeaderboard(25);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: "Kills Leaderboard",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setColor("#e615af")
      .setImage("https://i.imgur.com/ubWEkK6.gif")
      .setFooter({ text: "Showing Top 25 Players - This Wipe ONLY" })
      .setDescription(
        leaderboard
          .map(
            (player) =>
              `#${player.rank}. **${player.id}** | ${player.kills} Kills`
          )
          .join("\n")
      );

    await interaction.reply({ embeds: [embed] });
  }

  private async getLeaderboard(limit: number) {
    const data = await this.container.db.player.findMany({
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
        command.setName(this.name).setDescription(this.description);
      },
      {
        idHints: [],
      }
    );
  }
}
