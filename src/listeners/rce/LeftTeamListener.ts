import { Listener, container } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { TeamData } from "../../interfaces";
import { RCEEventType } from "../../vars";

@ApplyOptions<Listener.Options>({
  name: RCEEventType.LeftTeam,
  emitter: container.rce.emitter,
})
export default class LeftTeamListener extends Listener {
  public async run(team: TeamData) {
    const existingTeam = await this.container.db.gameTeam.findUnique({
      where: { teamId: team.teamId },
    });

    if (existingTeam) {
      const updatedActiveMembers = existingTeam.activeMembers.filter(
        (member) => member !== team.ign
      );

      await this.container.db.gameTeam.update({
        where: { teamId: team.teamId },
        data: {
          activeMembers: updatedActiveMembers,
          pastMembers: {
            push: team.ign,
          },
        },
      });
    }
  }
}
