import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import { type ChatInputCommandInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "ping",
  description: "Check the bot's latency to the Discord API",
})
export default class PingCommand extends Command {
  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    return interaction.reply({
      content: `Pong! 🏓 \`${this.container.client.ws.ping}ms\``,
      ephemeral: true,
    });
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
