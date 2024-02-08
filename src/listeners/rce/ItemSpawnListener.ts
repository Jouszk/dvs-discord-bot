import { Listener, container } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ItemSpawn } from "../../interfaces";
import { RCEEventType } from "../../vars";
import { PermissionFlagsBits, type TextChannel } from "discord.js";

@ApplyOptions<Listener.Options>({
  name: RCEEventType.ItemSpawnMessage,
  emitter: container.rce.emitter,
})
export default class ItemSpawnListener extends Listener {
  public async run(spawn: ItemSpawn) {
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
        `**${spawn.receiver}** received **${spawn.amount}x ${spawn.item}**`
      );
    }
  }
}
