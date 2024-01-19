import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import TicketManager from "../../util/TicketManager";
import { ModalQuestion, modalQuestions } from "../select/TicketCategorySelect";
import StringUtils from "../../util/StringUtils";

const readableSubjects = {
  raid_insurance: "Raid Insurance Claim",
  report_player: "Report a Player",
  vip_questions: "VIP Questions",
  other: "Other",
};

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit,
})
export class NewTicketModal extends InteractionHandler {
  public async parse(interaction: ModalSubmitInteraction) {
    return interaction.customId.startsWith("new_ticket-")
      ? this.some({
          subjectId: interaction.customId.split("-")[1],
          subject: readableSubjects[interaction.customId.split("-")[1]],
        })
      : this.none();
  }

  public async run(
    interaction: ModalSubmitInteraction,
    subject: { subjectId: string; subject: string }
  ) {
    await interaction.deferReply({ ephemeral: true });

    // Get the values from the modal
    const modalFields: ModalQuestion[] = modalQuestions[subject.subjectId];

    // Create an embed
    const embed = new EmbedBuilder()
      .setAuthor({
        iconURL: interaction.user.displayAvatarURL(),
        name: `${subject.subject} - ${interaction.user.username} (${interaction.user.id})`,
      })
      .setColor("#282b30")
      .setFooter({
        text: "Please wait patiently and somebody will respond to this ticket soon.",
      });

    modalFields.map((field) => {
      embed.addField(
        field.label,
        StringUtils.smartTrim(
          interaction.fields.getField(field.id).value || "-",
          1024
        ),
        false
      );
    });

    const channel = await TicketManager.createTicket(
      interaction.user,
      subject.subject,
      embed
    );

    return interaction.editReply({
      content: `Your ticket has been created: ${channel}`,
    });
  }
}
