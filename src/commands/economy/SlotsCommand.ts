import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  ColorResolvable,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import EconomyUtils, { FRUIT_VALUES } from "../../util/EconomyUtils";

@ApplyOptions<Command.Options>({
  name: "slots",
  description: "Gamble your DvS Coin away in a game of slots",
  runIn: "GUILD_ANY",
})
export default class SlotsCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand(
      (command) => {
        command
          .setName(this.name)
          .setDescription(this.description)
          .addNumberOption((option) =>
            option
              .setName("amount")
              .setDescription("The amount of DvS Coin to gamble")
              .setRequired(true)
              .setMinValue(1)
              .setMaxValue(50)
          );
      },
      {
        idHints: [],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const amount = interaction.options.getNumber("amount");

    const data = await this.container.db.economyUser.findFirst({
      where: {
        id: interaction.user.id,
      },
    });
    if (data.balance < BigInt(amount)) {
      return interaction.reply({
        content: "You don't have enough money to gamble that much!",
        ephemeral: true,
      });
    }

    await this.container.db.economyUser.update({
      where: {
        id: interaction.user.id,
      },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    const grid = EconomyUtils.generateSlotsGrid();

    const embed = new EmbedBuilder()
      .setColor(process.env.DISCORD_BOT_THEME as ColorResolvable)
      .setTitle("Spinning...")
      .setDescription(
        grid
          .map((row) =>
            row.map(() => "<a:slots:1212398903396401235>").join(" ")
          )
          .join("\n")
          .replace(/,/g, "")
      );

    const slotsMessage = await interaction.reply({
      embeds: [embed],
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    embed.setTitle("Slots");
    embed.setDescription(
      grid
        .map((row) => row.map((fruit) => fruit).join(" "))
        .join("\n")
        .replace(/,/g, "")
    );

    const win = EconomyUtils.checkSlotsWin(grid);
    let winnings = 0;

    if (win) {
      winnings = Math.floor(FRUIT_VALUES[win] * amount);

      embed.addField(
        "Congratulations!",
        `You profited <:dvscoin:1212381742485340180> **${
          winnings - amount
        } DvS Coin**!`
      );
      embed.setColor("#4caf50");

      await this.container.db.economyUser.update({
        where: {
          id: interaction.user.id,
        },
        data: {
          balance: {
            increment: winnings,
          },
        },
      });
    } else {
      embed.addField(
        "Better luck next time!",
        `You lost <:dvscoin:1212381742485340180> **${amount} DvS Coin**`
      );
      embed.setColor("#f44336");
    }

    slotsMessage.edit({ embeds: [embed] });
  }
}
