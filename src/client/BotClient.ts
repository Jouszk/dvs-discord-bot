import {
  SapphireClient,
  LogLevel,
  ApplicationCommandRegistries,
  RegisterBehavior,
  container,
} from "@sapphire/framework";
import { Partials, ActivityType } from "discord.js";
import CustomLogger from "../util/CustomLogger";
import { PrismaClient } from "@prisma/client";

export default class BotClient extends SapphireClient {
  public constructor() {
    super({
      intents: [
        "Guilds",
        "GuildMessages",
        "GuildMembers",
        "GuildPresences",
        "GuildMessageReactions",
        "MessageContent",
      ],
      partials: [Partials.Message, Partials.Reaction, Partials.User],
      logger: {
        instance: new CustomLogger(LogLevel.Info),
      },
      presence: {
        activities: [
          {
            name: "DvS Solo/Duo/Trio",
            type: ActivityType.Watching,
          },
        ],
        status: "dnd",
      },
    });
  }

  public override login(token?: string) {
    // Overwrite the default behavior of the application command registries
    ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
      RegisterBehavior.Overwrite
    );

    // Connect to the database
    container.db = new PrismaClient();

    // Login to discord
    return super.login(token);
  }
}

declare module "@sapphire/pieces" {
  interface Container {
    db: PrismaClient;
  }
}
