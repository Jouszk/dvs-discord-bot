import { Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";

import { CronTask } from "../../interfaces";
import WebCacheManager from "../../util/WebCacheManager";
import { Time } from "@sapphire/time-utilities";
import { ActivityType } from "discord.js";
import shopJson from "../../../json/shop.json";
import EmbedSender from "../../util/EmbedSender";

@ApplyOptions<Listener.Options>({
  name: "ready",
  once: true,
})
export default class ReadyListener extends Listener {
  public run() {
    // Return a message to the console when the bot is ready
    this.container.logger.info(
      `${this.container.client.user!.tag} is online and ready`
    );

    // Set the bot's status
    this.setStatus();
    setInterval(() => this.setStatus(), Time.Minute * 1);

    // Setup cron jobs
    const crons: CronTask[] = this.container.settings.get(
      "global",
      "crons",
      []
    );

    crons.map((cron) => {
      this.container.logger.info(`Setting up cron job: ${cron.name}`);

      this.container.rce.setCron(
        cron.serverId,
        cron.name,
        cron.time,
        cron.commands.split("\n")
      );
    });

    // Update the web cache
    this.container.webCache = new WebCacheManager();

    // Send embeds to a channel
    if (process.env.NODE_ENV !== "production") {
      // EmbedSender.sendEmbeds("1198925908711583744", shopJson);
    }
  }

  private async setStatus() {
    const servers = this.container.servers;
    this.container.client.user!.setActivity({
      name: `${servers.filter((server) => server.connected).length}/${
        servers.length
      } servers online`,
      type: ActivityType.Watching,
    });
  }
}
