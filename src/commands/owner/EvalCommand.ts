import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import { type ChatInputCommandInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { inspect } from "util";
import StringUtils from "../../util/StringUtils";

@ApplyOptions<Command.Options>({
  name: "eval",
  description: "Evaluate JavaScript code",
  preconditions: ["OwnerOnly"],
})
export default class EvalCommand extends Command {
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
              .setName("code")
              .setDescription("Code to evaluate")
              .setRequired(true)
          )
          .addBooleanOption((option) =>
            option
              .setName("ephemeral")
              .setDescription("Should the response be ephemeral?")
              .setRequired(false)
          )
          .addNumberOption((option) =>
            option
              .setName("depth")
              .setDescription("Depth of the evaluation")
              .setRequired(false)
              .setChoices(
                {
                  name: "None",
                  value: 0,
                },
                {
                  name: "Low",
                  value: 1,
                },
                {
                  name: "Medium",
                  value: 2,
                },
                {
                  name: "High",
                  value: 3,
                }
              )
          )
          .setDefaultMemberPermissions(0);
      },
      {
        idHints: [],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const code = interaction.options.getString("code", true);
    const ephemeral = interaction.options.getBoolean("ephemeral", false);
    const depth = interaction.options.getNumber("depth", false) || 2;

    await interaction.deferReply({
      ephemeral,
    });

    try {
      const result = inspect(await eval(code), {
        depth,
      });

      const output = StringUtils.smartTrim(result, 1900);

      return interaction.editReply({
        content: `\`\`\`js\n${output}\`\`\``,
      });
    } catch (error) {
      return interaction.editReply({
        content: `**Error:**\`\`\`xl\n${error}\`\`\``,
      });
    }
  }
}
