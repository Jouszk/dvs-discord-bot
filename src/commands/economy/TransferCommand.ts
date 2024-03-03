import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "transfer",
  description: "Give DvS Coins to another user",
})
export class TransferCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand(
      (x) =>
        x
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((c) =>
            c
              .setName("user")
              .setDescription("The discord user you want to give DvS Coins to")
              .setRequired(true)
          )
          .addNumberOption((c) =>
            c
              .setName("amount")
              .setDescription("The amount of DvS Coins you want to give")
              .setRequired(true)
              .setMinValue(1)
          ),
      { idHints: [] }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user", true);
    const amount = interaction.options.getNumber("amount", true);

    if (user.id === interaction.user.id) {
      return interaction.reply({
        ephemeral: true,
        content: "You cannot give DvS Coins to yourself",
      });
    }

    const userEconomy = await this.container.db.economyUser.findFirst({
      where: { id: interaction.user.id },
    });

    if (!userEconomy) {
      return interaction.reply({
        ephemeral: true,
        content: "You do not have an active economy account",
      });
    }

    if (userEconomy.balance < amount) {
      return interaction.reply({
        ephemeral: true,
        content: "You do not have enough DvS Coins to give",
      });
    }

    await this.container.db.economyUser.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        balance: amount,
      },
      update: {
        balance: {
          increment: amount,
        },
      },
    });

    await this.container.db.economyUser.update({
      where: { id: interaction.user.id },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    // Send log
    const channel = (await interaction.guild?.channels.fetch(
      process.env.COIN_LOGS_CHANNEL_ID!
    )) as TextChannel;
    channel.send({
      content: `**${
        interaction.user
      }** has transferred ${user} <:dvscoin:1212381742485340180> **${amount} DvS Coins**. They now have <:dvscoin:1212381742485340180> **${
        userEconomy.balance - amount
      } DvS Coins**.`,
    });

    return interaction.reply({
      content: `You have given <:dvscoin:1212381742485340180> **${amount} DvS Coins** to ${user}`,
      ephemeral: true,
    });
  }
}
