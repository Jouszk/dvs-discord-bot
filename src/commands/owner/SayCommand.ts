import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { RUST_ADMINS } from "../../vars";
import { servers } from "../../servers";

@ApplyOptions<Command.Options>({
  name: "say",
  description: "Send a message to the server chat",
  preconditions: ["GameAdminOnly"],
})
export default class SayCommand extends Command {
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
              .setName("msg")
              .setDescription("The message to send to the server")
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("server")
              .setDescription("Which server to send the command to")
              .setRequired(true)
              .setAutocomplete(true)
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers);
      },
      {
        idHints: [],
      }
    );
  }

  public chatInputRun(interaction: ChatInputCommandInteraction) {
    const message = interaction.options.getString("msg", true);
    const server = interaction.options.getString("server", true);
    const admin = RUST_ADMINS.find(
      (admin) => admin.discord === interaction.user.id
    );

    this.container.rce.sendCommandToServer(
      server,
      `say <color=${admin.chatColor}>[Admin]</color> [${admin.ign}]: <color=${admin.chatColor}>${message}</color>`
    );

    interaction.reply({
      content: `Successfully sent message to the server chat!`,
      ephemeral: true,
    });
  }
}
