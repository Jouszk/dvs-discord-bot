import { Precondition } from "@sapphire/framework";
import type { ChatInputCommandInteraction } from "discord.js";
import { RUST_ADMINS } from "../vars";

export default class GameAdminOnlyPrecondition extends Precondition {
  public async chatInputRun(interaction: ChatInputCommandInteraction) {
    if (RUST_ADMINS.some((admin) => admin.discord === interaction.user.id))
      return this.ok();

    return this.error({
      message: "You are not an in-game admin.",
    });
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    GameAdminOnly: never;
  }
}
