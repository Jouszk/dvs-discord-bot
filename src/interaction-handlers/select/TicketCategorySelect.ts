import {
  InteractionHandler,
  InteractionHandlerTypes,
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import {
  StringSelectMenuInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";

export interface ModalQuestion {
  label: string;
  id: string;
  style: "SHORT" | "PARAGRAPH";
  required: boolean;
  placeholder?: string;
}

export const modalQuestions = {
  raid_insurance: [
    {
      label: "What is your Xbox / PSN Username?",
      id: "in_game_name",
      style: "SHORT",
      required: true,
      placeholder: "i.e. Saucey Hub",
    },
    {
      label: "Which server are you playing?",
      id: "server",
      style: "SHORT",
      required: true,
      placeholder: "i.e. DvS Solo/Duo/Trio",
    },
    {
      label: "What was your old base grid?",
      id: "old_base_grid",
      style: "SHORT",
      required: true,
      placeholder: "i.e. T12",
    },
    {
      label: "Message",
      id: "message",
      style: "PARAGRAPH",
      required: false,
      placeholder: "i.e. I would like to claim my raid insurance.",
    },
  ],
  land_demolition: [
    {
      label: "What is your Xbox / PSN Username?",
      id: "in_game_name",
      style: "SHORT",
      required: true,
      placeholder: "i.e. Saucey Hub",
    },
    {
      label: "Which server are you playing?",
      id: "server",
      style: "SHORT",
      required: true,
      placeholder: "i.e. DvS Solo/Duo/Trio",
    },
    {
      label: "What grid would you like demolished?",
      id: "base_grid",
      style: "SHORT",
      required: true,
      placeholder: "i.e. T12 (NOTE: It must be decaying)",
    },
    {
      label: "Justification",
      id: "message",
      style: "PARAGRAPH",
      required: true,
      placeholder: "i.e. I would like to demolish this base because...",
    },
  ],
  report_player: [
    {
      label: "What is your Xbox / PSN Username?",
      id: "in_game_name",
      style: "SHORT",
      required: true,
      placeholder: "i.e. Saucey Hub",
    },
    {
      label: "Which server are you playing?",
      id: "server",
      style: "SHORT",
      required: true,
      placeholder: "i.e. DvS Solo/Duo/Trio",
    },
    {
      label: "What is the player's Xbox / PSN Username?",
      id: "reported_in_game_name",
      style: "SHORT",
      required: true,
      placeholder: "i.e. b1nzeee",
    },
    {
      label: "What is the player's base grid?",
      id: "reported_base_grid",
      style: "SHORT",
      required: false,
      placeholder: "i.e. T12",
    },
    {
      label: "Message",
      id: "message",
      style: "PARAGRAPH",
      required: true,
      placeholder: "i.e. This player is playing as a four man.",
    },
  ],
  vip_questions: [
    {
      label: "What is your Xbox / PSN Username?",
      id: "in_game_name",
      style: "SHORT",
      required: true,
      placeholder: "i.e. Saucey Hub",
    },
    {
      label: "What is your transaction ID?",
      id: "transaction_id",
      style: "SHORT",
      required: false,
      placeholder: "Leave this blank if you haven't purchased VIP.",
    },
    {
      label: "Message",
      id: "message",
      style: "PARAGRAPH",
      required: true,
      placeholder: "i.e. How long do I keep VIP for?",
    },
  ],
  purchase_shop: [
    {
      label: "What is your Xbox / PSN Username?",
      id: "in_game_name",
      style: "SHORT",
      required: true,
      placeholder: "i.e. Saucey Hub",
    },
    {
      label: "Which package ID would you like to purchase?",
      id: "package_id",
      style: "SHORT",
      required: true,
      placeholder: "i.e. #3 (Tier 3 Workbench Package)",
    },
  ],
  other: [
    {
      label: "What is your Xbox / PSN Username?",
      id: "in_game_name",
      style: "SHORT",
      required: true,
      placeholder: "i.e. Saucey Hub",
    },
    {
      label: "Which server are you playing?",
      id: "server",
      style: "SHORT",
      required: true,
      placeholder: "i.e. DvS Solo/Duo/Trio",
    },
    {
      label: "Message",
      id: "message",
      style: "PARAGRAPH",
      required: true,
      placeholder: "i.e. I have a question about the server.",
    },
  ],
};

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.SelectMenu,
})
export class TicketCategorySelect extends InteractionHandler {
  public async parse(interaction: StringSelectMenuInteraction) {
    return interaction.customId === "ticket_category"
      ? this.some()
      : this.none();
  }

  public async run(interaction: StringSelectMenuInteraction) {
    const selectedOption = interaction.values[0];
    const modalQuestionsArray: ModalQuestion[] = modalQuestions[selectedOption];

    const modal = new ModalBuilder()
      .setCustomId(`new_ticket-${selectedOption}`)
      .setTitle("New Ticket")
      .addComponents(
        modalQuestionsArray.map((question) => {
          return new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId(question.id)
              .setLabel(question.label)
              .setStyle(
                question.style === "SHORT"
                  ? TextInputStyle.Short
                  : TextInputStyle.Paragraph
              )
              .setRequired(question.required)
              .setPlaceholder(question.placeholder)
          );
        })
      );

    return await interaction.showModal(modal);
  }
}
