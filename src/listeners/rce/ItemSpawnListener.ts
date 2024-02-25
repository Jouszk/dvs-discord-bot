import { Listener, container } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ItemSpawnEvent } from "../../interfaces";
import { RCEEventType } from "../../vars";
import { PermissionFlagsBits, type TextChannel } from "discord.js";

@ApplyOptions<Listener.Options>({
  name: RCEEventType.ItemSpawnMessage,
  emitter: container.rce.emitter,
})
export default class ItemSpawnListener extends Listener {
  public async run(spawn: ItemSpawnEvent) {
    if (process.env.NODE_ENV !== "production") return;

    const channel = this.container.client.channels.cache.get(
      process.env.ADMIN_ITEM_SPAWNING_CHANNEL_ID
    ) as TextChannel;

    if (
      channel &&
      channel
        .permissionsFor(channel.guild.members.me)
        .has(PermissionFlagsBits.SendMessages)
    ) {
      await channel.send(
        `[${spawn.server.name}] **${spawn.spawn.receiver}** received **${spawn.spawn.amount}x ${spawn.spawn.item}**`
      );
    }
  }
}
