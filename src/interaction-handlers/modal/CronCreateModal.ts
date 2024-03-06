import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ModalSubmitInteraction } from "discord.js";
import { CronTask } from "../../interfaces";
import { servers } from "../../servers";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class CronCreateModal extends InteractionHandler {
  public async parse(interaction: ModalSubmitInteraction) {
    if (!interaction.customId.startsWith("cron_create_")) {
      return this.none();
    }

    return this.some({
      name: interaction.customId.split("_")[2],
      serverId: interaction.customId.split("_")[3],
    });
  }

  public async run(
    interaction: ModalSubmitInteraction,
    { name, serverId }: { name: string; serverId: string }
  ) {
    // Get the content from the modal
    const time = interaction.fields.getTextInputValue("cron_time");
    const commands = interaction.fields.getTextInputValue("cron_commands");

    // Create the cron task
    const task: CronTask = {
      name,
      time,
      commands,
      serverId,
    };

    // Save the cron task
    const crons = this.container.settings.get("global", "crons", []);
    crons.push(task);
    this.container.settings.set("global", "crons", crons);

    // Set the cron task
    this.container.rce.setCron(
      servers.find((s) => s.id === serverId),
      name,
      time,
      commands.split("\n")
    );

    // Send Response
    return interaction.reply({
      content: `The cron task \`${name}\` has been created.`,
      ephemeral: true,
    });
  }
}
