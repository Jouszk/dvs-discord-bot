import { Listener, container } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { NoteEdit } from "../../interfaces";
import { RCEEventType, RUST_ADMINS } from "../../vars";
import { Time } from "@sapphire/time-utilities";

@ApplyOptions<Listener.Options>({
  name: RCEEventType.NoteEdit,
  emitter: container.rce.emitter,
})
export default class NoteEditListener extends Listener {
  private rateLimit: Map<string, boolean> = new Map();

  public async run(note: NoteEdit) {
    this.container.logger.debug(note);

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

    // Change username color
    let color = "#ffffff";
    if (RUST_ADMINS.includes(note.username)) {
      color = "#ff0000"; // red
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
    }

    this.container.rce.sendCommand(
      `say [<color=${color}>${note.username}</color>]: <color=#ffffff>${note.newContent}</color>`
    );
  }
}
