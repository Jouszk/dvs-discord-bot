import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandType } from "discord-api-types/v10";
import {
  ActionRowBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

@ApplyOptions<Command.Options>({
  name: "Tag Message",
})
export class TagCommand extends Command {
  public async contextMenuRun(
    interaction: Command.ContextMenuCommandInteraction
  ) {
    // Fetch Message
    const target = await interaction.channel.messages.fetch(
      interaction.targetId
    );

    // Create a modal
    const modal = new ModalBuilder()
      .setCustomId("tag_create")
      .setTitle("Tag Creation")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("tag_name")
            .setLabel("Name")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(25)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("tag_content")
            .setLabel("Content")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(10)
            .setMaxLength(4000)
            .setValue(target.content)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("tag_image")
            .setLabel("Image URL")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(1000)
            .setValue(
              target.attachments
                .filter((attachment) => attachment.width && attachment.height)
                .first()?.url
            )
        )
      );

    await interaction.showModal(modal);
  }

  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerContextMenuCommand(
      (c) => {
        c.setName(this.name.charAt(0).toUpperCase() + this.name.slice(1))
          .setType(ApplicationCommandType.Message)
          .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
      },
      {
        idHints: [],
      }
    );
  }
}
