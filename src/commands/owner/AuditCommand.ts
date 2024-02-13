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
    await interaction.guild.members.fetch();

    const vips = await this.container.db.vIPUser.findMany();
    const members = interaction.guild.members.cache.filter((m) =>
      m.roles.cache.has(process.env.VIP_ROLE_ID)
    );

    await Promise.all(
      members.map((member) => {
        if (!vips.find((vip) => vip.discordId === member.id)) {
          member.roles.remove(process.env.VIP_ROLE_ID);
        }
      })
    );

    return interaction.editReply({
      content: "R.I.P to the VIPs who haven't paid",
    });
  }
}
