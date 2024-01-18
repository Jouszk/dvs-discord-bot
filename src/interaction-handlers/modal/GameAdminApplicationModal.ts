import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import {
  ColorResolvable,
  EmbedBuilder,
  ModalSubmitInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class GameAdminApplicationModal extends InteractionHandler {
  public async parse(interaction: ModalSubmitInteraction) {
    return interaction.customId === "game_admin_application"
      ? this.some()
      : this.none();
  }

  public async run(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ ephemeral: true });

    // Get values from modal
    const inGameName = interaction.fields.getField("in_game_name")?.value;
    const timePlayed = interaction.fields.getField("time_played")?.value;
    const adminExperience =
      interaction.fields.getField("admin_experience")?.value;
    const applicationReason =
      interaction.fields.getField("application_reason")?.value;
    const scenario = interaction.fields.getField("scenario")?.value;

    // Get application channel
    const channel = await this.getChannel<TextChannel>(
      process.env.DISCORD_STAFF_APPLICATION_CHANNEL_ID
    );

    // Send application
    if (
      channel &&
      channel
        .permissionsFor(channel.guild.members.me)
        .has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])
    ) {
      const embed = new EmbedBuilder()
        .setTitle("Game Admin Application")
        .setColor(process.env.DISCORD_BOT_THEME as ColorResolvable)
        .setDescription(
          `${interaction.user} (\`${interaction.user.id}\`) has submitted a game admin application.`
        )
        .setThumbnail(interaction.user.displayAvatarURL({ size: 512 }))
        .addField("Xbox Live / PlayStation Network Username", inGameName)
        .addField("Time Played on Rust Console Edition", timePlayed)
        .addField("Admin Experience", adminExperience)
        .addField("Application Reason", applicationReason)
        .addField(
          "Scenario (You see four players doing an offline raid, what do you do?)",
          scenario
        )
        .setFooter({ text: "Application Submitted" })
        .setImage(process.env.DISCORD_BOT_EMBED_FOOTER_URL)
        .setTimestamp();

      const message = await channel.send({ embeds: [embed] });
      await message.startThread({
        name: `GAA-${inGameName}`,
        reason: "Discuss Admin Application",
      });
    }

    // Send confirmation
    await interaction.editReply({
      content:
        "Your application has been submitted for review. Management will reach out to you if you are accepted.",
    });
  }

  private async getChannel<T>(channelId: string): Promise<T> {
    return (await this.container.client.channels.fetch(channelId)) as T;
  }
}
