import { Listener, container } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { KillEvent } from "../../interfaces";
import { RCEEventType } from "../../vars";
import { PermissionFlagsBits, type TextChannel } from "discord.js";
import { servers } from "../../servers";

@ApplyOptions<Listener.Options>({
  name: RCEEventType.KillMessage,
  emitter: container.rce.emitter,
})
export default class KillListener extends Listener {
  public async run(kill: KillEvent) {
    if (process.env.NODE_ENV !== "production") return;

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

    // Log the kill to the leaderboard
    const attacker = await this.container.db.player
      .upsert({
        where: { id: kill.kill.attacker, serverId: kill.server.id },
        update: {
          kills: {
            increment: 1,
          },
        },
        create: {
          id: kill.kill.attacker,
          serverId: kill.server.id,
          kills: 1,
        },
      })
      .catch(() => null);

    // Log the death to the leaderbaord
    const victim = await this.container.db.player
      .upsert({
        where: { id: kill.kill.victim, serverId: kill.server.id },
        update: {
          deaths: {
            increment: 1,
          },
        },
        create: {
          id: kill.kill.victim,
          serverId: kill.server.id,
          deaths: 1,
        },
      })
      .catch(() => null);

    // K/D ratio
    const attackerKd: number = (
      attacker?.deaths === 0
        ? attacker?.kills
        : attacker?.kills / attacker?.deaths
    ).toFixed(2);

    const victimKd: number = (
      victim?.deaths === 0 ? victim?.kills : victim?.kills / victim?.deaths
    ).toFixed(2);

    const blackOne = "<color=black>{</color> <color=#8b0000>";
    const blackTwo = "</color><color=black> }</color>";
    const feedsEnabled = this.container.settings.get("global", "feeds", true);
    if (feedsEnabled) {
      this.container.rce.sendCommand(
        servers.find((server) => server.id === kill.server.id),
        `say <color=red>${kill.kill.attacker} ${blackOne}${attackerKd}${blackTwo}</color> killed <color=red>${kill.kill.victim} ${blackOne}${victimKd}${blackTwo}`
      );
    }
  }
}
