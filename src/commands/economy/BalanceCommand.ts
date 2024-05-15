import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import { type ChatInputCommandInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "balance",
  description: "Check your DvS Coin balance",
})
export default class BalanceCommand extends Command {
  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getString("ign", true);

    const economy = await this.container.db.economyUser.findFirst({
      where: {
        id: {
          equals: user,
          mode: "insensitive",
        },
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
              .setName("ign")
              .setDescription("The IGN you want to check the balance of")
              .setRequired(true)
          );
      },
      {
        idHints: [],
      }
    );
  }
}
