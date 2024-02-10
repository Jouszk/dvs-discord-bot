import { Listener, container } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { PlayerJoin } from "../../interfaces";
import { RCEEventType } from "../../vars";

@ApplyOptions<Listener.Options>({
  name: RCEEventType.PlayerJoin,
  emitter: container.rce.emitter,
})
export default class PlayerJoinListener extends Listener {
  public async run(player: PlayerJoin) {
    const vipData = this.container.vipManager.getVIP(player.username);

    if (!vipData) {
      // User should not have VIP
      return this.container.rce.sendCommand(`RemoveVIP "${player.username}"`);
    }
  }
}
