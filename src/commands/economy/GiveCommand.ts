import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "give",
  description: "Give DvS Coins to another IGN",
  preconditions: ["OwnerOnly"],
})
export class GiveCommand extends Command {
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
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
      { idHints: [] }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getString("ign", true);
    const amount = interaction.options.getNumber("amount", true);

    const linkedAccount = await this.container.db.linkedAccount.findFirst({
      where: { id: { equals: user, mode: "insensitive" } },
      include: { economy: true },
    });

    if (!linkedAccount) {
      return interaction.reply({
        ephemeral: true,
        content: "This IGN is not linked to a Discord account",
      });
    }

    const economy = linkedAccount.economy!;
    economy.balance += amount;

    await this.container.db.economyUser.update({
      where: { id: user },
      data: {
        balance: economy.balance,
      },
    });

    // Send log
    const channel = (await interaction.guild?.channels.fetch(
      process.env.COIN_LOGS_CHANNEL_ID!
    )) as TextChannel;
    channel.send({
      content: `${interaction.user} has spawned ${user} <:dvscoin:1212381742485340180> ${amount} DvS Coins. They now have <:dvscoin:1212381742485340180> ${economy.balance} DvS Coins.`,
    });

    return interaction.reply({
      ephemeral: true,
      content: `You have given <:dvscoin:1212381742485340180> ${amount} DvS Coins to ${user}. They now have <:dvscoin:1212381742485340180> ${economy.balance} DvS Coins.`,
    });
  }
}
