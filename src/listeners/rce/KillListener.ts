import { Listener, container } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { KillEvent } from "../../interfaces";
import { RCEEventType } from "../../vars";
import { PermissionFlagsBits, type TextChannel } from "discord.js";

@ApplyOptions<Listener.Options>({
  name: RCEEventType.KillMessage,
  emitter: container.rce.emitter,
})
export default class KillListener extends Listener {
  public async run(kill: KillEvent) {
    // if (process.env.NODE_ENV !== "production") return;

    const serverId = `${kill.server.ipAddress}:${kill.server.port}`;

    const channel = this.container.client.channels.cache.get(
      process.env.DISCORD_KILLFEED_CHANNEL
    ) as TextChannel;

    if (
      channel &&
      channel
        .permissionsFor(channel.guild.members.me)
        .has(PermissionFlagsBits.SendMessages)
    ) {
      await channel.send(
        `[${kill.server.name}] **${kill.kill.attacker}** killed **${kill.kill.victim}**`
      );
    }

    this.container.rce.sendCommandToServer(
      serverId,
      `say <color=red>${kill.kill.attacker}</color> killed <color=red>${kill.kill.victim}</color>`
    );

    // Log the kill to the leaderboard
    await this.container.db.player.upsert({
      where: { id: kill.kill.attacker, serverId },
      update: {
        kills: {
          increment: 1,
        },
      },
      create: {
        id: kill.kill.attacker,
        serverId,
        kills: 1,
      },
    });

    // Log the death to the leaderbaord
    await this.container.db.player.upsert({
      where: { id: kill.kill.victim, serverId },
      update: {
        deaths: {
          increment: 1,
        },
      },
      create: {
        id: kill.kill.victim,
        serverId,
        deaths: 1,
      },
    });
  }
}
