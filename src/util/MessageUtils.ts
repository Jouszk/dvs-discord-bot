import type { Message } from "discord.js";
import { extname } from "path";

export default class MessageUtils {
  public static paginateArray<T>(
    array: any[],
    itemsPerPage: number,
    page: number
  ): Array<T> | null {
    const maxPages = Math.ceil(array.length / itemsPerPage);
    if (page < 1 || page > maxPages) return null;
    return array.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }

  public static findAttachment(message: Message): string {
    let attachmentImage: string;

    const extensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
    const linkRegex =
      /https?:\/\/(?:\w+\.)?[\w-]+\.[\w]{2,3}(?:\/[\w-_.]+)+\.(?:png|jpg|jpeg|gif|webp)/;

    const richEmbed = message.embeds.find(
      (embed) =>
        embed.image && extensions.includes(extname(embed.image.proxyURL))
    );

    if (richEmbed) {
      attachmentImage = richEmbed.image.proxyURL;
      return attachmentImage;
    }

    const attachment = message.attachments.find((file) =>
      extensions.includes(extname(file.proxyURL))
    );

    if (attachment) {
      attachmentImage = attachment.proxyURL;
      return attachmentImage;
    }

    if (!attachmentImage) {
      const linkMatch = message.content.match(linkRegex);
      if (linkMatch && extensions.includes(extname(linkMatch[0]))) {
        attachmentImage = linkMatch[0];
      }
    }

    return attachmentImage;
  }
}
