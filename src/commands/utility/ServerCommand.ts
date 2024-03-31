import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { servers } from "../../servers";

@ApplyOptions<Command.Options>({
  name: "server",
  description: "Check the stats of a server",
  preconditions: ["CommandChannelOnly"],
})
export class ServerCommand extends Command {
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
              .setName("server")
              .setDescription("Which server to check stats of")
              .setRequired(true)
              .setAutocomplete(true)
          ),
      { idHints: [] }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
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

    const population = this.container.rce.population.get(serverInfo.id);

    const embed = new EmbedBuilder()
      .setColor(process.env.DISCORD_BOT_THEME as ColorResolvable)
      .setImage(process.env.DISCORD_BOT_EMBED_FOOTER_URL)
      .setAuthor({
        name: `${serverInfo.name}`,
        iconURL: interaction.guild.iconURL(),
      })
      .setThumbnail(serverInfo.logo)
      .addField("Region", serverInfo.region, true)
      .addField("Uptime", serverInfo.connected ? "Online" : "Offline", true)
      .addField(
        "Population",
        population ? `${population.length}/${serverInfo.maxPop}` : "N/A",
        true
      )
      .addField("Features", serverInfo.features.join("\n"))
      .setFooter({
        text: serverInfo.game,
      });

    return interaction.reply({ embeds: [embed] });
  }
}
