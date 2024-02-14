import {
  methods,
  Route,
  type ApiRequest,
  type ApiResponse,
} from "@sapphire/plugin-api";
import { ApplyOptions } from "@sapphire/decorators";
import { User } from "discord.js";

@ApplyOptions<Route.Options>({
  route: "v1/tickets/:id",
})
export default class TicketRoute extends Route {
  public async [methods.GET](req: ApiRequest, res: ApiResponse) {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Missing id" });

    const ticket = await this.container.db.ticket.findUnique({
      where: { id: Number(id) },
      include: { messages: true },
    });

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const ticketMessages = await Promise.all(
      ticket.messages.map(async (message) => {
        const user: User =
          this.container.client.users.cache.get(message.author) ||
          (await this.container.client.users
            .fetch(message.author)
            .catch(() => null));

        if (user) {
          return {
            id: message.id,
            author: `${user.username} (${user.id})`,
            content: message.content,
            createdAt: message.createdAt.toLocaleString(),
          };
        }
      })
    );

    return res.json({
      author: ticket.author,
      createdAt: ticket.createdAt.toLocaleString(),
      updatedAt: ticket.updatedAt.toLocaleString(),
      messages: ticketMessages.sort((a, b) => a.id - b.id),
    });
  }
}
