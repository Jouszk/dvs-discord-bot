import { Listener } from "@sapphire/framework";
import { PermissionFlagsBits, type Message } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Time } from "@sapphire/time-utilities";
import TicketManager from "../../util/TicketManager";

const DISCORD_INVITE_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord\.com\/invite)\/([a-zA-Z0-9-]{2,32})/g;

@ApplyOptions<Listener.Options>({
  name: "messageCreate",
})
export default class MessageCreateListener extends Listener {
  public modCache = new Map<string, number>();

  public async run(message: Message) {
    if (message.author.bot || !message.guild) return;

    if (
      !message.member.permissions.has(PermissionFlagsBits.ManageMessages) &&
      message.member.moderatable
    ) {
      // Check if the message contains a Discord invite link which doesn't belong to the server.
      const invite = DISCORD_INVITE_REGEX.exec(message.content);

      if (invite) {
        // Get the invite code from the link.
        const firstInvite = invite[0];
        const inviteCode = firstInvite.split("/").pop();

        // Get the invite from the invite code.
        const inviteFetch = await message.guild.invites
          .fetch(inviteCode)
          .catch(() => null);

        // If the invite is not valid, delete the message.
        if (!inviteFetch) {
          const current = this.modCache.get(message.author.id) || 0;
          this.modCache.set(message.author.id, current + 1);

          await message.delete();

          if (current >= 3) {
            await message.member.timeout(Time.Day * 1, "Posting invite links.");
            await message.channel
              .send(
                `${message.author}, you have been muted for 1 day for posting invite links.`
              )
              .then((msg) => {
                setTimeout(() => {
                  msg.delete();
                }, 5000);
              });

            this.modCache.delete(message.author.id);
          } else {
            await message.channel
              .send(
                `${message.author} please do not post invite links or you will be muted.`
              )
              .then((msg) => {
                setTimeout(() => {
                  msg.delete();
                }, 5000);
              });
          }
        }
      }
    }

    // Check if the message is a ticket message.
    if (await TicketManager.isValidTicketChannel(message.channel.id)) {
      await TicketManager.addReplyToTicket(message);
    }
  }
}
