import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import {
  EmbedBuilder,
  type ChatInputCommandInteraction,
  ColorResolvable,
} from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { SellixTransaction } from "../../interfaces";

const embedColor = {
  PENDING: "#f44336",
  COMPLETED: "#4caf50",
  REFUNDED: "#ff9800",
};

const status = {
  PENDING: "Pending",
  COMPLETED: "Paid",
  REFUNDED: "Refunded",
};

@ApplyOptions<Command.Options>({
  name: "sellix",
  description: "Validate a Sellix transaction",
  preconditions: ["OwnerOnly"],
})
export default class SellixCommand extends Command {
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
              .setName("transaction")
              .setDescription("The transaction ID to validate")
              .setRequired(false)
          )
          .setDefaultMemberPermissions(8);
      },
      {
        idHints: [],
      }
    );
  }

  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    const transactionId =
      interaction.options.getString("transaction", false) || null;

    if (!transactionId) {
      const transaction = await this.fetchMostRecentTransaction();

      if (!transaction) {
        return interaction.reply({
          content: "No transactions found.",
          ephemeral: true,
        });
      }

      return interaction.reply({
        embeds: [this.getEmbed(transaction)],
      });
    }

    const transaction = await this.fetchTransaction(transactionId);

    if (!transaction) {
      return interaction.reply({
        content: "No transaction found.",
        ephemeral: true,
      });
    }

    return interaction.reply({
      embeds: [this.getEmbed(transaction)],
    });
  }

  private getEmbed(transaction: SellixTransaction) {
    const product = this.container.webCache.cache.shopProducts.find(
      (p) => p.id === transaction.product_id
    );

    return new EmbedBuilder()
      .setColor(embedColor[transaction.status] as ColorResolvable)
      .setTitle(`Sellix Transaction: ${transaction.uniqid}`)
      .setThumbnail(product?.image_url || undefined)
      .addField("Product", product?.title || "Unknown", true)
      .addField(
        "Price",
        `${transaction.total.toFixed(2)} ${transaction.currency}`,
        true
      )
      .addField("Status", status[transaction.status], true)
      .addField("Email", this.maskEmail(transaction.customer_email), true)
      .addField("Quantity", transaction.quantity.toString(), true)
      .setTimestamp(transaction.created_at * 1000)
      .setFooter({ text: "Purchased" });
  }

  private maskEmail(email: string) {
    const parts = email.split("@");
    const usernameStart = parts[0].substring(0, 5);
    const maskedUsername =
      usernameStart + parts[0].substring(5).replace(/./g, "*");
    const maskedEmail = maskedUsername + "@" + parts[1];
    return maskedEmail;
  }

  private async fetchTransaction(
    transactionId: string
  ): Promise<SellixTransaction | null> {
    const res = await fetch(
      `https://dev.sellix.io/v1/orders/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SELLIX_API_KEY}`,
        },
      }
    );

    if (!res.ok) return null;

    const data = await res.json();

    return (data?.data?.order as SellixTransaction) || null;
  }

  private async fetchMostRecentTransaction(): Promise<SellixTransaction | null> {
    const res = await fetch(`https://dev.sellix.io/v1/orders`, {
      headers: {
        Authorization: `Bearer ${process.env.SELLIX_API_KEY}`,
      },
    });

    if (!res.ok) return null;

    const data = await res.json();

    return (data?.data?.orders[0] as SellixTransaction) || null;
  }
}
