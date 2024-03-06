import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import { type ChatInputCommandInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "feeds",
  description: "Toggle the feeds for the server.",
  preconditions: ["OwnerOnly"],
})
export default class FeedsCommand extends Command {
  public chatInputRun(interaction: ChatInputCommandInteraction) {
    const currentStatus = this.container.settings.get("global", "feeds", true);
    this.container.settings.set("global", "feeds", !currentStatus);

    return interaction.reply({
      content: `Feeds are now ${!currentStatus ? "enabled" : "disabled"}.`,
      ephemeral: true,
    });
  }

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
}
