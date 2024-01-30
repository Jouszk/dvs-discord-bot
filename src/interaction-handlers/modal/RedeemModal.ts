import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import {
  ModalSubmitInteraction,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class RedeemModal extends InteractionHandler {
  public async parse(interaction: ModalSubmitInteraction) {
    return interaction.customId === "redeem_key" ? this.some() : this.none();
  }

  public async run(interaction: ModalSubmitInteraction) {
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

    // Delete the key
    redeemKeys.splice(redeemKeys.indexOf(redeemKey), 1);

    // Save the keys
    this.container.settings.set("global", "keys", redeemKeys);

    // Replace {username} with the in game name in the commands array
    redeemKey.commands = redeemKey.commands.map((command) =>
      command.replace(/{username}/g, inGameName)
    );

    // Add VIP if the command starts with VIPID
    if (redeemKey.commands[0].startsWith("VIPID")) {
      // Add VIP with discord ID
      const existingVIP = this.container.vipManager.getVIP(inGameName);

      if (!existingVIP) {
        await this.container.vipManager.addVIP(
          inGameName,
          30,
          interaction.user.id
        );
      } else {
        await this.container.vipManager.updateVIP(
          inGameName,
          30,
          interaction.user.id
        );
      }

      // Remove the VIPID command
      redeemKey.commands.shift();
    }

    // Execute the commands
    if (redeemKey.commands.length) {
      this.container.rce.sendCommands(redeemKey.commands);
    }

    // Send to code redemption channel
    const channel = this.container.client.channels.cache.get(
      process.env.CODE_REDEMPTION_LOG_CHANNEL_ID
    ) as TextChannel;

    if (
      channel &&
      channel
        .permissionsFor(interaction.guild.members.me)
        .has([PermissionFlagsBits.SendMessages])
    ) {
      channel.send({
        content: `**${interaction.user}** redeemed \`${
          redeemKey.name
        }\`\n\`\`\`\n${redeemKey.commands.join("\n")}\n\`\`\`\n**Key:** \`${
          redeemKey.key
        }\`\n**In-Game Username:** \`${inGameName}\``,
      });
    }

    // Send a response
    return interaction.reply({
      content: `You have successfully redeemed \`${redeemKey.name}\`.`,
      ephemeral: true,
    });
  }
}
