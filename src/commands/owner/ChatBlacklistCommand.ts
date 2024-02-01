import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import { type ChatInputCommandInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "chat-blacklist",
  description: "Toggle chat blacklist for a user",
  preconditions: ["OwnerOnly"],
})
export default class ChatBlacklistCommand extends Command {
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
              .setName("ign")
              .setDescription("In-game name of the user to blacklist")
              .setRequired(true)
          )
          .setDefaultMemberPermissions(8);
      },
      {
        idHints: [],
      }
    );
  }

  public chatInputRun(interaction: ChatInputCommandInteraction) {
    const ign = interaction.options.getString("ign", true).toLowerCase();

    const blacklist = this.container.settings.get(
      "global",
      "chat.blacklist",
      []
    );

    const index = blacklist.indexOf(ign);

    if (index === -1) {
      blacklist.push(ign);
    } else {
      blacklist.splice(index, 1);
    }

    this.container.settings.set("global", "chat.blacklist", blacklist);

    interaction.reply({
      content: `Successfully ${
        index === -1 ? "added" : "removed"
      } **${ign}** from the chat blacklist!`,
      ephemeral: true,
    });
  }
}
