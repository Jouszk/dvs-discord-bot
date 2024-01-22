import { Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";

import EmbedSender from "../../util/EmbedSender";
import rustRulesJson from "../../../data/rustRules.json";
import discordRulesJson from "../../../data/discordRules.json";
import welcomeJson from "../../../data/welcome.json";
import faqJson from "../../../data/faq.json";
import vipUpgradeJson from "../../../data/vipUpgrade.json";
import raidInsuranceJson from "../../../data/raidInsurance.json";
import staffTeamJson from "../../../data/staffTeam.json";
import staffApplicationJson from "../../../data/staffApplication.json";
import openTicketJson from "../../../data/openTicket.json";
import usefulCommandsJson from "../../../data/usefulCommands.json";
import shopJson from "../../../data/shop.json";
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

    // Send rules embeds to the rules channel
    // EmbedSender.sendEmbeds("1152707745808650321", openTicketJson);
  }
}
