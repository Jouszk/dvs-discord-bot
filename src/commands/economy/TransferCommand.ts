import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import { ChatInputCommandInteraction, TextChannel } from "discord.js";
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
          .addStringOption((c) =>
            c
              .setName("ign")
              .setDescription("The IGN you want to give DvS Coins to")
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
    const user = interaction.options.getString("ign", true);
    const amount = interaction.options.getNumber("amount", true);

    const linkedAccount = await this.container.db.linkedAccount.findFirst({
      where: { discordId: interaction.user.id },
      include: { economy: true },
    });

    if (!linkedAccount) {
      return interaction.reply({
        ephemeral: true,
        content:
          "Your Discord account is not linked to an in-game account, use the `/link` command to link your account",
      });
    }

    if (user.toLowerCase() === linkedAccount.id.toLowerCase()) {
      return interaction.reply({
        ephemeral: true,
        content: "You cannot give DvS Coins to yourself",
      });
    }

    if (!linkedAccount.economy) {
      return interaction.reply({
        ephemeral: true,
        content: "You do not have an active economy account",
      });
    }

    if (linkedAccount.economy.balance < amount) {
      return interaction.reply({
        ephemeral: true,
        content: "You do not have enough DvS Coins to give",
      });
    }

    const targetLinkedAccount = await this.container.db.linkedAccount.findFirst(
      {
        where: { id: { equals: user, mode: "insensitive" } },
        include: { economy: true },
      }
    );

    if (!targetLinkedAccount) {
      return interaction.reply({
        ephemeral: true,
        content: "The user you are trying to give DvS Coins to is not linked",
      });
    }

    await this.container.db.economyUser.update({
      where: { id: targetLinkedAccount.id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    await this.container.db.economyUser.update({
      where: { id: linkedAccount.id },
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
      content: `**${interaction.user}** has transferred <@${
        targetLinkedAccount.discordId
      }> <:dvscoin:1212381742485340180> **${amount} DvS Coins**. They now have <:dvscoin:1212381742485340180> **${
        linkedAccount.economy.balance - amount
      } DvS Coins**.`,
    });

    return interaction.reply({
      content: `You have given <:dvscoin:1212381742485340180> **${amount} DvS Coins** to \`${user}\``,
      ephemeral: true,
    });
  }
}
