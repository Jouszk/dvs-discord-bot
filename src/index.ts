import dotenv from "dotenv";
dotenv.config();

import BotClient from "./client/BotClient";

// Extender Imports
import "./extenders/EmbedBuilder";

const client = new BotClient();
client.login(process.env.DISCORD_BOT_TOKEN);
