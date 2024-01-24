import { Listener, container } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { KillMessage } from "../../interfaces";
import { RCEEventType } from "../../vars";
import { PermissionFlagsBits, type TextChannel } from "discord.js";

@ApplyOptions<Listener.Options>({
  name: RCEEventType.KillMessage,
  emitter: container.rce.emitter,
})
export default class KillListener extends Listener {
  public async run(kill: KillMessage) {
    const channel = this.container.client.channels.cache.get(
      process.env.DISCORD_KILLFEED_CHANNEL
    ) as TextChannel;

    if (
      channel &&
      channel
        .permissionsFor(channel.guild.members.me)
        .has(PermissionFlagsBits.SendMessages)
    ) {
      await channel.send(`**${kill.attacker}** killed **${kill.victim}**`);
    }

    this.container.rce.sendCommand(
      `say <color=red>${kill.attacker}</color> killed <color=red>${kill.victim}</color>`
    );

    // Log the kill to the leaderboard
    await this.container.db.player.upsert({
      where: { id: kill.attacker },
      update: {
        kills: {
          increment: 1,
        },
      },
      create: {
        id: kill.attacker,
        kills: 1,
      },
    });
  }
}
