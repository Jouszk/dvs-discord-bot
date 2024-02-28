import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import {
  EmbedBuilder,
  type ChatInputCommandInteraction,
  ColorResolvable,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { shopPacks } from "../../vars";

@ApplyOptions<Command.Options>({
  name: "shop",
  description: "View the DvS Coin shop",
})
export default class ShopCommand extends Command {
  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const economy = await this.container.db.economyUser.findFirst({
      where: {
        id: interaction.user.id,
      },
    });

    const embed = new EmbedBuilder()
      .setTitle("DvS Coin Shop")
      .setFooter({ text: "Click 'Purchase' and enter Item ID" })
      .setThumbnail(interaction.guild.iconURL())
      .setColor(process.env.DISCORD_BOT_THEME as ColorResolvable)
      .setImage(process.env.DISCORD_BOT_EMBED_FOOTER_URL)
      .setDescription(
        `Your current balance is <:dvscoin:1212381742485340180> **${
          economy?.balance || 0
        } DvS Coins**`
      );

    shopPacks
      .sort((a, b) => a.id - b.id)
      .forEach((pack) => {
        embed.addField(
          `ID: ${pack.id} - ${pack.name}`,
          `**Price:** <:dvscoin:1212381742485340180> **${pack.price} DvS Coins**`
        );
      });

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("shop_purchase")
        .setLabel("Purchase")
        .setStyle(ButtonStyle.Success)
    );

    return interaction.reply({
      embeds: [embed],
      components: [actionRow],
      ephemeral: true,
    });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand(
      (command) => {
        command.setName(this.name).setDescription(this.description);
      },
      {
        idHints: [],
      }
    );
  }
}
