import { Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";

import { CronTask } from "../../interfaces";

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

    // Fetch members
    this.container.client.guilds.cache.map((guild) => {
      guild.members.fetch();
    });

    // Setup cron jobs
    const crons: CronTask[] = this.container.settings.get(
      "global",
      "crons",
      []
    );

    crons.map((cron) => {
      this.container.logger.info(`Setting up cron job: ${cron.name}`);

      this.container.rce.setCron(
        cron.name,
        cron.time,
        cron.commands.split("\n")
      );
    });

    // Send embeds to a channel
    if (process.env.NODE_ENV !== "production") {
      // EmbedSender.sendEmbeds("1198925908711583744", shopJson);
    }
  }
}
