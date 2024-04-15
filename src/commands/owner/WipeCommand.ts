import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import { type ChatInputCommandInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

interface CronTask {
  name: string;
  time: string;
  commands: string;
  serverId: string;
}

@ApplyOptions<Command.Options>({
  name: "wipe",
  description: "Run this command to wipe anything related to the wipe.",
  preconditions: ["OwnerOnly"],
})
export default class WipeCommand extends Command {
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
              .setDescription("The server to wipe data from.")
              .setRequired(true)
              .setAutocomplete(true)
          )
          .setDefaultMemberPermissions(8);
      },
      {
        idHints: [],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const server = interaction.options.getString("server", true);
    await interaction.deferReply({ ephemeral: true });

    // Wipe leaderboard / kills data
    await this.container.db.player.deleteMany({ where: { serverId: server } });

    // Wipe cron jobs
    const crons: CronTask[] = this.container.settings.get(
      "global",
      "crons",
      []
    );
    crons.forEach((cron) => {
      if (cron.serverId === server) {
        crons.splice(crons.indexOf(cron), 1);
      }
    });
    this.container.settings.set("global", "crons", crons);

    return interaction.editReply({
      content:
        "Leaderboard data and crons have been wiped. A restart is required.",
    });
  }
}
