import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { RUST_ADMINS } from "../../vars";

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
          .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers);
      },
      {
        idHints: [],
      }
    );
  }

  public chatInputRun(interaction: ChatInputCommandInteraction) {
    const message = interaction.options.getString("msg", true);
    const admin = RUST_ADMINS.find(
      (admin) => admin.discord === interaction.user.id
    );

    this.container.rce.sendCommand(
      `say [<color=#ff0000>${admin.ign}</color>]: ${message}`
    );

    interaction.reply({
      content: `Successfully sent message to the server chat!`,
      ephemeral: true,
    });
  }
}
