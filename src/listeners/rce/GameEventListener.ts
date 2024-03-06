import { Listener, container } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { RCEEventType } from "../../vars";
import { GameEvent } from "../../interfaces";
import { servers } from "../../servers";

@ApplyOptions<Listener.Options>({
  name: RCEEventType.EventMessage,
  emitter: container.rce.emitter,
})
export default class GameEventListener extends Listener {
  public async run(event: GameEvent) {
    // if (process.env.NODE_ENV !== "production") return;

    this.container.rce.sendCommand(
      servers.find((server) => server.id === event.server.id),
      `say <color=green>${event.event}</color> is incoming...`
    );
  }
}
