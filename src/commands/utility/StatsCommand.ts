import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { servers } from "../../servers";

@ApplyOptions<Command.Options>({
  name: "stats",
  description: "Check the stats of a player",
})
export class RankCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand(
      (x) =>
        x
          .setName(this.name)
          .setDescription(this.description)
          .addStringOption((c) =>
            c
              .setName("ign")
              .setDescription(
                "The in-game name of the player you want to check the stats of"
              )
              .setRequired(true)
          )
          .addStringOption((c) =>
            c
              .setName("server")
              .setDescription("Which server to send the command to")
              .setRequired(true)
              .setAutocomplete(true)
          ),
      { idHints: [] }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const ign = interaction.options.getString("ign", true).toLowerCase();
    const server = interaction.options.getString("server", true);

    const serverInfo = servers.find(
      (s) => s.id.toLowerCase() === server.toLowerCase()
    );

    if (!serverInfo) {
      return interaction.reply({
        content: "Invalid server",
        ephemeral: true,
      });
    }

    if (serverInfo.limited) {
      return interaction.reply({
        content:
          "This is a **limited** automation server and doesn't have a killfeed / leaderboard.",
        ephemeral: true,
      });
    }

    const stats = await this.container.db.player.findFirst({
      where: {
        id: {
          equals: ign,
          mode: "insensitive",
        },
        serverId: server,
      },
    });
    const vip = this.container.vipManager.getVIP(ign);

    if (!stats) {
      return interaction.reply({
        content: "Player not found",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(process.env.DISCORD_BOT_THEME as ColorResolvable)
      .setImage(process.env.DISCORD_BOT_EMBED_FOOTER_URL)
      .setAuthor({
        name: `[${serverInfo.name}] ${ign}`,
        iconURL: interaction.guild.iconURL(),
      })
      .addField("Kills", stats.kills.toString(), true)
      .addField("Deaths", stats.deaths.toString(), true)
      .addField("K/D", (stats.kills / stats.deaths).toFixed(2), true)
      .setDescription(vip ? "This player is a VIP" : "This player is not a VIP")
      .setFooter({ text: "These statistics only reflect this current wipe" });

    return interaction.reply({ embeds: [embed] });
  }
}
