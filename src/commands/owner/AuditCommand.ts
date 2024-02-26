import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import { type ChatInputCommandInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "audit",
  description: "Remove VIP from users who should not have it",
  preconditions: ["OwnerOnly"],
})
export default class AuditCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand(
      (command) => {
        command
          .setName(this.name)
          .setDescription(this.description)
          .setDefaultMemberPermissions(0);
      },
      {
        idHints: [],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const kills = await this.container.db.player.findMany();

    // Change serverId to "server1"
    for (const kill of kills) {
      await this.container.db.player.update({
        where: {
          id: kill.id,
        },
        data: {
          serverId: "server1",
        },
      });
    }

    await interaction.editReply("Done");
  }
}
