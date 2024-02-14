import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  ColorResolvable,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { stripIndents } from "common-tags";

@ApplyOptions<Command.Options>({
  name: "tickets",
  description: "View tickets of a user",
  preconditions: ["GameAdminOnly"],
})
export default class TicketsCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand(
      (command) => {
        command
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) =>
            option
              .setName("user")
              .setDescription("The user of the ticket author")
              .setRequired(true)
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers);
      },
      {
        idHints: [],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user", true);

    // Get the tickets
    const tickets = await this.container.db.ticket.findMany({
      where: { author: user.id },
    });

    // If there are no tickets
    if (!tickets.length) {
      return interaction.reply({
        ephemeral: true,
        content: "No tickets found",
      });
    }

    // Create the embed
    const embed = new EmbedBuilder()
      .setColor(process.env.DISCORD_BOT_THEME as ColorResolvable)
      .setImage(process.env.DISCORD_BOT_EMBED_FOOTER_URL)
      .setTitle(`${user.username}'s Tickets`)
      .setDescription(
        tickets
          .sort((a, b) => a.id - b.id)
          .slice(0, 15)
          .map(
            (ticket) =>
              stripIndents`**ID:** [${
                ticket.id
              }](https://api.dvs.gg/v1/tickets/${ticket.id})
              **Subject:** ${ticket.category}
              **Created At:** ${ticket.createdAt.toLocaleString()}`
          )
          .join("\n\n")
      );

    // Send the embed
    return interaction.reply({
      ephemeral: true,
      embeds: [embed],
    });
  }
}
