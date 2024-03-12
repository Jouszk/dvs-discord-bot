import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  ModalBuilder,
  type ChatInputCommandInteraction,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { servers } from "../../servers";

@ApplyOptions<Command.Options>({
  name: "redeem",
  description: "Redeem a redeem key",
})
export default class RedeemCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand(
      (command) => {
        command
          .setName(this.name)
          .setDescription(this.description)
          .addStringOption((option) =>
            option
              .setName("server")
              .setDescription("The server to redeem the key on")
              .setRequired(true)
              .setAutocomplete(true)
          );
      },
      {
        idHints: [],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const server = interaction.options.getString("server", true);
    const serverInfo = servers.find(
      (s) => s.id.toLowerCase() === server.toLowerCase()
    );

    if (!serverInfo) {
      return interaction.reply({
        content: "Invalid server",
        ephemeral: true,
      });
    }

    if (serverInfo.pvp) {
      return interaction.reply({
        content: "You cannot redeem keys on a PvP-only server",
        ephemeral: true,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(`redeem_key_${server}`)
      .setTitle("Redeem a Key")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("in_game_name")
            .setLabel("What is your Xbox / PSN Username?")
            .setPlaceholder("i.e. Saucey Hub (it is important to be exact)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(3)
            .setMaxLength(25)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("redeem_key")
            .setLabel("Redeem Key")
            .setPlaceholder("This is provided to you by an admin")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(12)
            .setMaxLength(12)
        )
      );

    // Send Modal
    return await interaction.showModal(modal);
  }
}
