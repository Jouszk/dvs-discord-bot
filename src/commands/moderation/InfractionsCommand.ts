import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  time,
  type ChatInputCommandInteraction,
  type User,
  PermissionFlagsBits,
  EmbedBuilder,
  ColorResolvable,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Moderation } from "@prisma/client";
import { stripIndents } from "common-tags";
import { moderationType } from "../../util/ModerationUtils";
import MessageUtils from "../../util/MessageUtils";

@ApplyOptions<Command.Options>({
  name: "infractions",
  description: "View infractions for a member in the server",
})
export class InfractionsCommand extends Command {
  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const user: User = interaction.options.getUser("user");
    const page: number = interaction.options.getInteger("page") || 1;

    // Fetch Infractions from Database
    const infractions = await this.container.db.moderation.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Check if the user has any infractions
    if (!infractions.length) {
      return interaction.reply({
        content: `${user} has no infractions in this server.`,
        ephemeral: true,
      });
    }

    // Paginate Infractions
    const infractionsPage = MessageUtils.paginateArray<Moderation>(
      infractions,
      5,
      page
    );

    // Create Embed
    const embed = new EmbedBuilder()
      .setTitle(
        `Infractions | ${user.discriminator === "0" ? user.username : user.tag}`
      )
      .setColor(process.env.DISCORD_BOT_THEME as ColorResolvable)
      .setDescription(
        infractionsPage
          .map(
            (i) =>
              stripIndents`
                Case ID: [#${i.id}](https://discord.com/channels/${
                interaction.guildId
              }/${process.env.DISCORD_MOD_LOG_CHANNEL_ID}/${i.logId})
                Type: ${moderationType[i.type]}
                Moderator: <@${i.moderatorId}> (\`${i.moderatorId}\`)
                Date: ${time(i.createdAt, "F")} (${time(i.createdAt, "R")})
                Reason:
                \`\`\`
                ${i.reason}
                \`\`\`
              `
          )
          .join("\n\n")
      )
      .setFooter({ text: `Page ${page} of ${infractionsPage.length}` })
      .setImage(process.env.DISCORD_BOT_EMBED_FOOTER_URL);

    // Send Embed
    return interaction.reply({ embeds: [embed] });
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand(
      (c) =>
        c
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((o) =>
            o
              .setName("user")
              .setDescription("The user to view infractions for")
              .setRequired(true)
          )
          .addIntegerOption((o) =>
            o
              .setName("page")
              .setDescription("The page of infractions to view")
              .setRequired(false)
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Manage Messages
      { idHints: [] }
    );
  }
}
