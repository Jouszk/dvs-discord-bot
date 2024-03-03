import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "give",
  description: "Give DvS Coins to another user",
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
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
      { idHints: [] }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user", true);
    const amount = interaction.options.getNumber("amount", true);

    const economy = await this.container.db.economyUser.upsert({
      where: {
        id: user.id,
      },
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
