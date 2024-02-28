import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  AttachmentBuilder,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import EconomyUtils, { ROULETTE_NUMBERS } from "../../util/EconomyUtils";

@ApplyOptions<Command.Options>({
  name: "roulette",
  description: "Gamble your DvS Coin away in a game of roulette",
})
export default class RouletteCommand extends Command {
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
          )
          .addNumberOption((option) =>
            option
              .setName("number")
              .setDescription("The number to bet on")
              .setRequired(true)
              .setMinValue(0)
              .setMaxValue(36)
          );
      },
      {
        idHints: [],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const amount = interaction.options.getNumber("amount", true);
    const number = interaction.options.getNumber("number", true);
    const color = interaction.options.getString("color");
    const parity = interaction.options.getString("parity");

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

    if (number == undefined && !color && !parity) {
      return interaction.reply({
        content: "You must specify a number, color, or parity to bet on!",
        ephemeral: true,
      });
    }

    if (number && color) {
      return interaction.reply({
        content: "You can't bet on a number and color at the same time!",
        ephemeral: true,
      });
    }

    if (number && parity) {
      return interaction.reply({
        content: "You can't bet on a number and parity at the same time!",
        ephemeral: true,
      });
    }

    if (color && parity) {
      return interaction.reply({
        content: "You can't bet on a color and parity at the same time!",
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

    const winningNumber = Math.floor(Math.random() * 37);
    const buffer = await EconomyUtils.generateRouletteImage(winningNumber);

    const attachment = new AttachmentBuilder(buffer, {
      name: "roulette.png",
    });

    const embed = new EmbedBuilder()
      .setColor("#4caf50")
      .setImage("attachment://roulette.png")
      .setTitle("Roulette");

    if (number != undefined && number === winningNumber) {
      await this.container.db.economyUser.update({
        where: {
          id: interaction.user.id,
        },
        data: {
          balance: {
            increment: amount * 10,
          },
        },
      });

      embed.setDescription(
        `You profited <:dvscoin:1212381742485340180> **${
          amount * 10 - amount
        } DvS Coin** by betting on **${number}**!`
      );
    } else if (
      color &&
      color ===
        ROULETTE_NUMBERS.find((num) => num.number === winningNumber).color
    ) {
      await this.container.db.economyUser.update({
        where: {
          id: interaction.user.id,
        },
        data: {
          balance: {
            increment: amount * 2,
          },
        },
      });

      embed.setDescription(
        `You profited <:dvscoin:1212381742485340180> **${
          amount * 2 - amount
        } DvS Coin** by betting on **${color}**!`
      );
    } else if (parity && parity === "even" && winningNumber % 2 === 0) {
      await this.container.db.economyUser.update({
        where: {
          id: interaction.user.id,
        },
        data: {
          balance: {
            increment: amount * 2,
          },
        },
      });

      embed.setDescription(
        `You profited <:dvscoin:1212381742485340180> **${
          amount * 2 - amount
        } DvS Coin** by betting on **${parity}**!`
      );
    } else if (parity && parity === "odd" && winningNumber % 2 === 1) {
      await this.container.db.economyUser.update({
        where: {
          id: interaction.user.id,
        },
        data: {
          balance: {
            increment: amount * 2,
          },
        },
      });

      embed.setDescription(
        `You profited <:dvscoin:1212381742485340180> **${
          amount * 2 - amount
        } DvS Coin** by betting on **${parity}**!`
      );
    } else {
      embed.setDescription(
        `You lost <:dvscoin:1212381742485340180> **${amount} DvS Coin** by betting on **${
          number ?? color ?? parity
        }**!`
      );
      embed.setColor("#f44336");
    }

    return interaction.reply({
      embeds: [embed],
      files: [attachment],
    });
  }
}
