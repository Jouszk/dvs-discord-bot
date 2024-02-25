import { Listener, container } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { NoteEditEvent } from "../../interfaces";
import { RCEEventType, RUST_ADMINS } from "../../vars";
import { Time } from "@sapphire/time-utilities";
import { PermissionFlagsBits, TextChannel } from "discord.js";

@ApplyOptions<Listener.Options>({
  name: RCEEventType.NoteEdit,
  emitter: container.rce.emitter,
})
export default class NoteEditListener extends Listener {
  private rateLimit: Map<string, boolean> = new Map();

  public async run(note: NoteEditEvent) {
    // if (process.env.NODE_ENV !== "production") return;

    // Anti-Code Leak
    // If the note contains a 4 digit number, it's probably a code leak
    note.note.newContent = note.note.newContent.replace(/\d{4}/g, "[REDACTED]");

    // Exploit patch
    note.note.newContent = note.note.newContent.replace("@", "@/");

    // Blacklist handler
    const blacklist = this.container.settings.get(
      "global",
      "chat.blacklist",
      []
    );
    if (blacklist.includes(note.note.username.toLowerCase())) return;

    // Set a rate limit of 1 message per 15 seconds
    if (this.rateLimit.get(note.note.username)) return;
    this.rateLimit.set(note.note.username, true);
    setTimeout(
      () => this.rateLimit.delete(note.note.username),
      Time.Second * 15
    );

    // Change role color and name
    let color = "#ffffff";
    let role = "";
    if (RUST_ADMINS.some((admin) => admin.ign === note.note.username)) {
      const admin = RUST_ADMINS.find(
        (admin) => admin.ign === note.note.username
      );

      color = admin.chatColor;
      role = "[Admin]";
    } else {
      const isVip = await container.db.vIPUser.findFirst({
        where: {
          id: {
            equals: note.note.username.toLowerCase(),
            mode: "insensitive",
          },
        },
      });

      color = isVip ? isVip.chatColor : "#ffffff";
      if (isVip) role = "[VIP]";
    }

    // Send to RCE if in production
    if (process.env.NODE_ENV === "production") {
      this.container.rce.sendCommandToServer(
        `${note.server.ipAddress}:${note.server.port}`,
        `say ${
          role !== "" ? `<color=${color}>${role}</color> ` : ""
        }[<color=#ffffff>${note.note.username}</color>]: <color=${color}>${
          note.note.newContent
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
        content: `[${note.server.name}] **${note.note.username}**: ${note.note.newContent}`,
      });
    }
  }
}
