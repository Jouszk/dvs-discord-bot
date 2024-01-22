import { Listener, container } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { RCEEventType } from "../../util/RCEManager";

@ApplyOptions<Listener.Options>({
  name: RCEEventType.EventMessage,
  emitter: container.rce.emitter,
})
export default class GameEventListener extends Listener {
  public async run(event: string) {
    this.container.rce.sendCommand(
      `say <color=green>${event}</color> is incoming...`
    );
  }
}
