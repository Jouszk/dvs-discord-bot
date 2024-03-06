import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import { type ChatInputCommandInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { servers } from "../../servers";

@ApplyOptions<Command.Options>({
  name: "console",
  description: "Send a command to the RCE server",
  preconditions: ["OwnerOnly"],
})
export default class ConsoleCommand extends Command {
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
              .setName("command")
              .setDescription("Command to send in-game")
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("server")
              .setDescription("Server to send the command to")
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
    const command = interaction.options.getString("command", true);
    const server = interaction.options.getString("server", true);

    await interaction.deferReply({ ephemeral: true });

    const success = await this.container.rce.sendCommand(
      servers.find((s) => s.id === server),
      command
    );
    if (success) {
      await interaction.editReply({
        content: `Sent command \`${command}\` to RCE server`,
      });
    } else {
      await interaction.editReply({
        content: "Failed to send command to RCE server",
      });
    }
  }
}
