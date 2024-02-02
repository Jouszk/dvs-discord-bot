import { Listener, container } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { NoteEdit } from "../../interfaces";
import { RCEEventType, RUST_ADMINS } from "../../vars";
import { Time } from "@sapphire/time-utilities";
import { PermissionFlagsBits, TextChannel } from "discord.js";

@ApplyOptions<Listener.Options>({
  name: RCEEventType.NoteEdit,
  emitter: container.rce.emitter,
})
export default class NoteEditListener extends Listener {
  private rateLimit: Map<string, boolean> = new Map();

  public async run(note: NoteEdit) {
    // this.container.logger.debug(note);

    // Anti-Code Leak
    // If the note contains a 4 digit number, it's probably a code leak
    note.newContent = note.newContent.replace(/\d{4}/g, "[REDACTED]");

    // Blacklist handler
    const blacklist = this.container.settings.get(
      "global",
      "chat.blacklist",
      []
    );
    if (blacklist.includes(note.username.toLowerCase())) return;

    // Set a rate limit of 1 message per 15 seconds
    if (this.rateLimit.get(note.username)) return;
    this.rateLimit.set(note.username, true);
    setTimeout(() => this.rateLimit.delete(note.username), Time.Second * 15);

    // Change role color and name
    let color = "#ffffff";
    let role = "";
    if (RUST_ADMINS.some((admin) => admin.ign === note.username)) {
      color = "#ff0000"; // red
      role = "[Admin]";
    } else {
      const isVip = await container.db.vIPUser.findFirst({
        where: {
          id: {
            equals: note.username.toLowerCase(),
            mode: "insensitive",
          },
        },
      });

      color = isVip ? "#00ff00" : "#ffffff";
      if (isVip) role = "[VIP]";
    }

    // Send to RCE if in production
    if (process.env.NODE_ENV === "production") {
      this.container.rce.sendCommand(
        `say ${
          role !== "" ? `<color=${color}>${role}</color> ` : ""
        }[<color=#ffffff>${note.username}</color>]: <color=${color}>${
          note.newContent
        }</color>`
      );
    }

    // Send to discord
    const channel = this.container.client.channels.cache.get(
      process.env.GLOBAL_CHAT_CHANNEL_ID
    ) as TextChannel;
    if (
      channel &&
      channel
        .permissionsFor(channel.guild.members.me)
        .has(PermissionFlagsBits.SendMessages)
    ) {
      channel.send({
        content: `**${note.username}**: ${note.newContent}`,
      });
    }
  }
}
