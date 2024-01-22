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
import RCEManager from "../util/RCEManager";
import { SettingsProvider } from "../util/SettingsProvider";

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

  public override async login(token?: string) {
    // Overwrite the default behavior of the application command registries
    ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
      RegisterBehavior.Overwrite
    );

    // Connect to the database
    container.db = new PrismaClient();
    container.settings = new SettingsProvider(container.db);
    await container.settings.init();

    // Connect to the RCE server
    container.rce = new RCEManager();

    // Login to discord
    return super.login(token);
  }
}

declare module "@sapphire/pieces" {
  interface Container {
    db: PrismaClient;
    rce: RCEManager;
    settings: SettingsProvider;
  }
}
