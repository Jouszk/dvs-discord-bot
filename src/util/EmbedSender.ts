import {
  PermissionFlagsBits,
  EmbedBuilder,
  type TextChannel,
  type ColorResolvable,
  ActionRowBuilder,
  ButtonBuilder,
  User,
  StringSelectMenuBuilder,
} from "discord.js";
import { container } from "@sapphire/framework";

interface EmbedSelectMenuOption {
  label: string;
  value: string;
  description?: string;
}

interface EmbedSelectMenu {
  id: string;
  placeholder?: string;
  options: EmbedSelectMenuOption[];
}

interface EmbedButton {
  id?: string;
  text: string;
  style: number;
  url?: string;
}

interface EmbedContent {
  title?: string;
  content?: string;
  footerImage?: number;
  image?: string;
  buttons?: EmbedButton[];
  selectMenu?: EmbedSelectMenu;
  thumbnail?: string;
  userId?: string;
}

class EmbedSender {
  private static async getChannel(channelId: string): Promise<TextChannel> {
    return (await container.client.channels.fetch(channelId)) as TextChannel;
  }

  public static async sendEmbeds(
    channelId: string,
    embedContent: EmbedContent[]
  ) {
    const channel = await this.getChannel(channelId);

    if (
      channel &&
      channel
        .permissionsFor(channel.guild.members.me)
        .has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])
    ) {
      // Fetch messages to purge
      const messages = await channel.messages.fetch();
      await channel.bulkDelete(messages);

      // Send new embeds
      embedContent.map(async (embed) => {
        const user: User = embed.userId
          ? await container.client.users.fetch(embed.userId).catch(() => null)
          : null;

        const newEmbed = new EmbedBuilder()
          .setTitle(embed.title || null)
          .setThumbnail(
            embed.thumbnail || user?.displayAvatarURL({ size: 512 }) || null
          )
          .setDescription(embed.content || null)
          .setColor(process.env.DISCORD_BOT_THEME as ColorResolvable)
          .setImage(embed.image);

        if (embed.footerImage && embed.footerImage > 0) {
          if (embed.footerImage === 1) {
            newEmbed.setImage(process.env.DISCORD_BOT_EMBED_BLANK_FOOTER_URL);
          }

          if (embed.footerImage === 2) {
            newEmbed.setImage(process.env.DISCORD_BOT_EMBED_FOOTER_URL);
          }
        }

        // If buttons are provided, create an action row and add the buttons
        const btnActionRow = embed.buttons
          ? new ActionRowBuilder<ButtonBuilder>().addComponents(
              embed.buttons.map((button) => {
                const buttonBuilder = new ButtonBuilder()
                  .setLabel(button.text)
                  .setStyle(button.style);

                if (button.url) {
                  buttonBuilder.setURL(button.url);
                }

                if (button.id) {
                  buttonBuilder.setCustomId(button.id);
                }

                return buttonBuilder;
              })
            )
          : undefined;

        // If select menu is provided, add it to the embed
        const selectMenuActionRow = embed.selectMenu
          ? new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
              new StringSelectMenuBuilder()
                .setCustomId(embed.selectMenu.id)
                .setPlaceholder(embed.selectMenu.placeholder || "")
                .addOptions(
                  embed.selectMenu.options.map((option) => ({
                    label: option.label,
                    value: option.value,
                    description: option.description,
                  }))
                )
            )
          : undefined;

        const components = new Array();
        if (btnActionRow) components.push(btnActionRow);
        if (selectMenuActionRow) components.push(selectMenuActionRow);

        await channel.send({
          embeds: [newEmbed],
          components,
        });
      });
    }
  }
}

export default EmbedSender;
