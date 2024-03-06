import { Listener, container } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { PlayerJoinEvent } from "../../interfaces";
import { RCEEventType } from "../../vars";
import { servers } from "../../servers";

@ApplyOptions<Listener.Options>({
  name: RCEEventType.PlayerJoin,
  emitter: container.rce.emitter,
})
export default class PlayerJoinListener extends Listener {
  public async run(player: PlayerJoinEvent) {
    if (process.env.NODE_ENV !== "production") return;

    const vipData = this.container.vipManager.getVIP(player.username);

    if (!vipData) {
      const feedsEnabled = this.container.settings.get("global", "feeds", true);
      if (feedsEnabled) {
        // return this.container.rce.sendCommand(
        //   servers.find((server) => server.id === player.server.id),
        //   `RemoveVIP "${player.username}"`
        // );
      }
    } else {
      return this.container.rce.sendCommand(
        servers.find((server) => server.id === player.server.id),
        `VIPID "${player.username}"`
      );
    }
  }
}
