import { Precondition } from "@sapphire/framework";
import type { ChatInputCommandInteraction } from "discord.js";

export default class OwnerPrecondition extends Precondition {
  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    if (
      [
        "581235801900318741",
        "980202628384432248",
        "1005186019391442944",
      ].includes(interaction.user.id)
    )
      return this.ok();

    return this.error({
      message: "You are not the owner of this bot.",
    });
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    OwnerOnly: never;
  }
}
