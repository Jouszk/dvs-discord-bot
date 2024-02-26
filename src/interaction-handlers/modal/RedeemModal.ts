import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ColorResolvable,
  EmbedBuilder,
  ModalSubmitInteraction,
} from "discord.js";
import { stripIndents } from "common-tags";
import { servers } from "../../servers";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class RedeemModal extends InteractionHandler {
  public async parse(interaction: ModalSubmitInteraction) {
    if (!interaction.customId.startsWith("redeem_key_")) {
      return this.none();
    }

    return this.some(interaction.customId.split("_")[2]);
  }

  public async run(interaction: ModalSubmitInteraction, serverId: string) {
    // Get the content from the modal
    const inGameName = interaction.fields
      .getTextInputValue("in_game_name")
      .replace("#", "");
    const rKey = interaction.fields.getTextInputValue("redeem_key");

    // Get the keys
    const redeemKeys = this.container.settings.get("global", "keys", []);

    // Find the key
    let redeemKey = redeemKeys.find((key) => key.key === rKey);

    // If the key doesn't exist, send a response
    if (!redeemKey) {
      return interaction.reply({
        content: "You provided an invalid redeem key.",
        ephemeral: true,
      });
    }

    const serverInfo = servers.find(
      (s) => s.id.toLowerCase() === serverId.toLowerCase()
    );

    const embed = new EmbedBuilder()
      .setColor(process.env.DISCORD_BOT_THEME as ColorResolvable)
      .setTitle("Redeem Key")
      .setDescription(
        stripIndents`
        You are redeeming \`${redeemKey.name}\` for the in-game username: \`${inGameName}\`

        Please confirm the following:

        - Your in-game username: \`${inGameName}\`
        - You are in-game and ready to receive the items
        - Your inventory is EMPTY
        - You're in a safe location
        - You're redeeming the key on the server: \`${serverInfo?.name}\`
      `
      )
      .setImage(process.env.DISCORD_BOT_EMBED_FOOTER_URL);

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(
          `confirm_redeem@${redeemKey.key}@${inGameName}@${serverId}`
        )
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Success)
    );

    // Send a response
    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
      components: [actionRow],
    });
  }
}
