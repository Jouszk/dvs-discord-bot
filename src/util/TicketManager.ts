import { container } from "@sapphire/framework";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CategoryChannel,
  EmbedBuilder,
  Message,
  PermissionFlagsBits,
  User,
} from "discord.js";

export default class TicketManager {
  private static getTicketCategory(): CategoryChannel {
    return container.client.channels.cache.get(
      process.env.DISCORD_TICKET_CATEGORY_ID
    ) as CategoryChannel;
  }

  public static async isValidTicketChannel(channelId: string) {
    const ticket = await container.db.ticket.findFirst({
      where: {
        channel: channelId,
      },
    });

    return !!ticket;
  }

  public static async addReplyToTicket(message: Message) {
    const ticket = await container.db.ticket.findFirst({
      where: {
        channel: message.channel.id,
      },
    });

    if (!ticket) return;

    await container.db.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        content: message.content,
        author: message.author.id,
      },
    });
  }

  public static async closeTicket(channelId: string) {
    const ticketChannel = await container.client.channels.fetch(channelId);
    await ticketChannel.delete();
  }

  public static async createTicket(
    author: User,
    subject: string,
    embed: EmbedBuilder
  ) {
    const ticketCategory = this.getTicketCategory();
    const ticketChannel = await ticketCategory.guild.channels.create({
      name: `ticket_${author.username.replace(/\s/g, "_")}`,
      parent: ticketCategory,
      permissionOverwrites: [
        {
          id: ticketCategory.guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: author.id,
          allow: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: process.env.SUPPORT_ROLE_ID,
          allow: [PermissionFlagsBits.ViewChannel],
        },
      ],
      topic: `${subject} - ${author.username} (${author.id})`,
    });

    // Create a button action row
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("Close Ticket")
        .setStyle(ButtonStyle.Danger)
    );

    await ticketChannel.send({
      content: author.toString(),
      embeds: [embed],
      components: [actionRow],
    });

    // Create ticket in database and add first message to the relation
    await container.db.ticket.create({
      data: {
        author: author.id,
        channel: ticketChannel.id,
        category: subject,
        messages: {
          create: {
            content: JSON.stringify(embed.toJSON()),
            author: author.id,
          },
        },
      },
    });

    return ticketChannel;
  }
}
