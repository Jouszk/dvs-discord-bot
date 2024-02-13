import { Listener, container } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { TeamData } from "../../interfaces";
import { RCEEventType } from "../../vars";

@ApplyOptions<Listener.Options>({
  name: RCEEventType.JoinedTeam,
  emitter: container.rce.emitter,
})
export default class JoinTeamListener extends Listener {
  public async run(team: TeamData) {
    const existingTeam = await this.container.db.gameTeam.findUnique({
      where: { teamId: team.teamId },
    });

    if (existingTeam) {
      const updatedPastMembers = existingTeam.pastMembers.filter(
        (member) => member !== team.ign
      );

      await this.container.db.gameTeam.update({
        where: { teamId: team.teamId },
        data: {
          activeMembers: {
            push: team.ign,
          },
          pastMembers: updatedPastMembers,
        },
      });
    }

    if (!existingTeam) {
      await this.container.db.gameTeam.create({
        data: {
          teamId: team.teamId,
          activeMembers: [team.ign],
          pastMembers: [],
        },
      });
    }
  }
}
