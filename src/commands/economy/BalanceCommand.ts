import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import { type ChatInputCommandInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "balance",
  description: "Check your DvS Coin balance",
})
export default class BalanceCommand extends Command {
  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user", false) || interaction.user;

    const economy = await this.container.db.economyUser.findFirst({
      where: {
        id: user.id,
      },
    });

    return interaction.reply({
      content: `${user} has <:dvscoin:1212381742485340180> ${
        economy?.balance || 0
      } DvS Coins!`,
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
              .setName("user")
              .setDescription("The user you want to check the balance of")
              .setRequired(false)
          );
      },
      {
        idHints: [],
      }
    );
  }
}
