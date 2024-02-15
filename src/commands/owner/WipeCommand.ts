import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import { type ChatInputCommandInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

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
          .setDefaultMemberPermissions(8);
      },
      {
        idHints: [],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    await this.container.db.player.deleteMany({});
    await this.container.db.gameTeam.deleteMany({});
    this.container.settings.delete("global", "crons");

    return interaction.editReply({
      content:
        "Leaderboard data and crons have been wiped. A restart is required.",
    });
  }
}
