import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import { type ChatInputCommandInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "link",
  description: "Link your Discord account to your in-game account",
})
export default class LinkCommand extends Command {
  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const ign = interaction.options.getString("ign", true);

    // Check if the user has already linked their account
    const discordLinked = await this.container.db.linkedAccount.findFirst({
      where: {
        discordId: interaction.user.id,
      },
    });

    if (discordLinked) {
      return interaction.reply({
        content:
          "Your discord account is already linked to an in-game account, unlink via the `/profile` command",
        ephemeral: true,
      });
    }

    // Check if the in-game name is already linked
    const ignLinked = await this.container.db.linkedAccount.findFirst({
      where: {
        id: {
          equals: ign,
          mode: "insensitive",
        },
      },
    });

    if (ignLinked) {
      return interaction.reply({
        content: "This in-game name is already linked to a discord account",
        ephemeral: true,
      });
    }

    // Generate a 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000);

    // Start a verification session
    this.container.verifications.set(ign.toLowerCase(), {
      ign: ign.toLowerCase(),
      discord: interaction.user.id,
      code,
    });

    // Send the verification code to the user
    return interaction.reply({
      content: `Please edit a Note in-game and type the following code to verify IGN ownership:\n\n\`\`\`${code}\`\`\``,
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
          .addStringOption((option) =>
            option
              .setName("ign")
              .setDescription("Your in-game name")
              .setRequired(true)
          );
      },
      {
        idHints: [],
      }
    );
  }
}
