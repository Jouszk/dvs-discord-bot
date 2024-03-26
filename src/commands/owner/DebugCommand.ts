import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Command.Options>({
  name: "debug",
  description: "A command to send an output for inventory.giveto",
  preconditions: ["OwnerOnly"],
})
export default class DebugCommand extends Command {
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
              .setName("item1")
              .setDescription("The first item to give")
              .setRequired(true)
              .setAutocomplete(true)
          )
          .addStringOption((option) =>
            option
              .setName("item2")
              .setDescription("The second item to give")
              .setRequired(false)
              .setAutocomplete(true)
          )
          .addStringOption((option) =>
            option
              .setName("item3")
              .setDescription("The third item to give")
              .setRequired(false)
              .setAutocomplete(true)
          )
          .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers);
      },
      {
        idHints: [],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const item1 = interaction.options.getString("item1", true);
    const item2 = interaction.options.getString("item2", true) ?? null;
    const item3 = interaction.options.getString("item3", true) ?? null;

    const output = [`inventory.giveto "{username}" "${item1}" "1"`];
    if (item2) output.push(`inventory.giveto "{username}" "${item2}" "1"`);
    if (item3) output.push(`inventory.giveto "{username}" "${item3}" "1"`);

    await interaction.reply(output.join("\n"));
  }
}
