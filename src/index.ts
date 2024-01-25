import dotenv from "dotenv";

process.env.NODE_ENV === "production"
  ? dotenv.config({ path: ".env.prod" })
  : dotenv.config({ path: ".env.dev" });

import BotClient from "./client/BotClient";

// Extender Imports
import "./extenders/EmbedBuilder";

const client = new BotClient();
client.login(process.env.DISCORD_BOT_TOKEN);
