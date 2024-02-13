import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import { Role, type ChatInputCommandInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "audit",
  description: "Remove VIP from users who should not have it",
  preconditions: ["OwnerOnly"],
})
export default class AuditCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand(
      (command) => {
        command
          .setName(this.name)
          .setDescription(this.description)
          .setDefaultMemberPermissions(0);
      },
      {
        idHints: [],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const vips = await this.container.db.vIPUser.findMany();
    const vipRole: Role = await this.container.client.guilds.cache
      .first()
      ?.roles.fetch(process.env.VIP_ROLE_ID)
      .catch(() => null);

    if (!vipRole) {
      return interaction.editReply({
        content: "VIP role not found",
      });
    }

    await Promise.all(
      vipRole.members.map((member) => {
        if (!vips.find((vip) => vip.discordId === member.id)) {
          member.roles.remove(vipRole);
        }
      })
    );

    return interaction.editReply({
      content: "R.I.P to the VIPs who haven't paid",
    });
  }
}
