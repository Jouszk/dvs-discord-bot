import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  ModalBuilder,
  type ChatInputCommandInteraction,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { keyPresets } from "../../keyPresets";

@ApplyOptions<Command.Options>({
  name: "new-key",
  description: "Generate a new redeem key",
  preconditions: ["OwnerOnly"],
})
export default class NewKeyCommand extends Command {
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
              .setName("key-name")
              .setDescription("The name of the key to display to users")
              .setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("key-preset")
              .setDescription("Use a preset command to run on redeem")
              .setRequired(false)
              .setAutocomplete(true)
          )
          .setDefaultMemberPermissions(8);
      },
      {
        idHints: [],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const keyName = interaction.options.getString("key-name", true);
    const keyPreset = interaction.options.getString("key-preset", false);

    const preset = keyPresets.find(
      (preset) => preset.name.toLowerCase() === keyPreset?.toLowerCase()
    );

    const modal = new ModalBuilder()
      .setCustomId(`new_key_${keyName}`)
      .setTitle("Create Redeem Key")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("key_commands")
            .setLabel("Redemption Commands")
            .setPlaceholder("Separate commands with a new line")
            .setStyle(TextInputStyle.Paragraph)
            .setValue(preset?.commands.join("\n") ?? "")
            .setRequired(true)
            .setMinLength(0)
            .setMaxLength(2000)
        )
      );

    // Send Modal
    return await interaction.showModal(modal);
  }
}
