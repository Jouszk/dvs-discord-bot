import { container } from "@sapphire/framework";
import { Time } from "@sapphire/time-utilities";
import { TextChannel, type GuildMember, EmbedBuilder } from "discord.js";

interface VIP {
  id: string;
  discordId: string;
  expiresAt: Date;
  timeoutRef?: NodeJS.Timeout;
}

export default class VIPManager {
  public vips: VIP[] = [];

  public constructor() {
    this.init();
    this.scheduleDatabaseCheck();
  }

  private async init() {
    // Load VIPs from database
    this.vips = await container.db.vIPUser.findMany();

    // Add scheduled expiration for each VIP
    this.vips.forEach((vip) => {
      this.setExpiration(vip);
    });
  }

  private scheduleDatabaseCheck() {
    this.checkDatabaseForVIPUpdates();
    setInterval(() => {
      this.checkDatabaseForVIPUpdates();
    }, Time.Minute * 30);
  }

  private async checkDatabaseForVIPUpdates() {
    const vips = await container.db.vIPUser.findMany();

    vips.forEach((vip) => {
      const existingVIP = this.vips.find((v) => v.id === vip.id);

      if (!existingVIP) {
        this.vips.push(vip);
        this.setExpiration(vip);
      } else if (existingVIP.expiresAt.getTime() !== vip.expiresAt.getTime()) {
        if (existingVIP.timeoutRef) clearTimeout(existingVIP.timeoutRef);
        this.setExpiration(vip);
        existingVIP.expiresAt = vip.expiresAt;
      }
    });
  }

  private setExpiration(vip: VIP) {
    const maxTimeoutDuration = 2147483647; // Maximum 32-bit integer value
    let duration = vip.expiresAt.getTime() - Date.now();

    if (duration <= 0) {
      this.expireVIP(vip);
      return;
    }

    const scheduleTimeout = () => {
      vip.timeoutRef = setTimeout(() => {
        duration = vip.expiresAt.getTime() - Date.now();

        if (duration > maxTimeoutDuration) {
          scheduleTimeout();
        } else {
          this.expireVIP(vip);
        }
      }, Math.min(duration, maxTimeoutDuration));
    };

    scheduleTimeout();
  }

  public async expireVIP(vip: VIP) {
    // Remove VIP status
    this.vips = this.vips.filter((v) => v.id !== vip.id);
    await container.db.vIPUser.delete({
      where: {
        id: vip.id,
      },
    });

    // Remove VIP in-game
    container.rce.sendCommand(`RemoveVIP "${vip.id}"`);

    // Remove VIP in Discord (if possible)
    const member: GuildMember = container.client.guilds.cache
      .first()
      .members.cache.get(vip.discordId);

    await member?.roles.remove(process.env.VIP_ROLE_ID);

    // Remove scheduled expiration
    if (vip.timeoutRef) clearTimeout(vip.timeoutRef);

    // Log VIP expiration
    const embed = new EmbedBuilder()
      .setColor("#f44336")
      .setTitle("VIP Expired")
      .addField("In-Game Name", vip.id, true)
      .addField(
        "Discord",
        vip.discordId ? `<@${vip.discordId}>` : "None",
        true
      );

    const vipLogs = container.client.channels.cache.get(
      process.env.VIP_LOGS_CHANNEL_ID
    ) as TextChannel;

    vipLogs?.send({ embeds: [embed] });
  }

  public async addVIP(
    inGameName: string,
    duration: number,
    discordId?: string
  ) {
    // Check if VIP already exists
    const existingVip = this.vips.find((v) => v.id === inGameName);
    if (existingVip) {
      throw new Error("VIP already exists");
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);

    // Create new VIP
    const vip = await container.db.vIPUser.create({
      data: {
        id: inGameName,
        expiresAt,
        discordId,
      },
    });

    // Add VIP in-game
    container.rce.sendCommand(`VIPID "${vip.id}"`);

    // Add VIP in Discord (if possible)
    const member: GuildMember = container.client.guilds.cache
      .first()
      .members.cache.get(discordId);

    await member?.roles.add(process.env.VIP_ROLE_ID);

    // Add scheduled expiration
    this.vips.push(vip);
    this.setExpiration(vip);

    // Log VIP addition
    const embed = new EmbedBuilder()
      .setColor("#4caf50")
      .setTitle("VIP Added")
      .addField("In-Game Name", vip.id, true)
      .addField("Discord", vip.discordId ? `<@${vip.discordId}>` : "None", true)
      .addField("Expires At", vip.expiresAt.toLocaleString(), true);

    const vipLogs = container.client.channels.cache.get(
      process.env.VIP_LOGS_CHANNEL_ID
    ) as TextChannel;

    vipLogs?.send({ embeds: [embed] });
  }

  public async updateVIP(
    inGameName: string,
    duration?: number,
    discordId?: string
  ) {
    const vipIndex = this.vips.findIndex((v) => v.id === inGameName);
    if (vipIndex === -1) {
      throw new Error("VIP not found");
    }

    // Update VIP details
    const vip = this.vips[vipIndex];
    if (duration !== undefined) {
      const newExpiryAt = new Date(vip.expiresAt);
      newExpiryAt.setDate(newExpiryAt.getDate() + duration);
      vip.expiresAt = newExpiryAt;
      console.log(vip.expiresAt);
    }
    vip.discordId = discordId ?? vip.discordId;

    // Update VIP in database
    await container.db.vIPUser.update({
      where: {
        id: vip.id,
      },
      data: {
        expiresAt: vip.expiresAt,
        discordId: vip.discordId,
      },
    });

    // Reset scheduled expiration (if necessary)
    if (vip.timeoutRef) clearTimeout(vip.timeoutRef);
    this.setExpiration(vip);

    // Log VIP update
    const embed = new EmbedBuilder()
      .setColor("#3498db")
      .setTitle("VIP Updated")
      .addField("In-Game Name", vip.id, true)
      .addField("Discord", vip.discordId ? `<@${vip.discordId}>` : "None", true)
      .addField("Expires At", vip.expiresAt.toLocaleString(), true);

    const vipLogs = container.client.channels.cache.get(
      process.env.VIP_LOGS_CHANNEL_ID
    ) as TextChannel;

    vipLogs?.send({ embeds: [embed] });
  }

  public getVIP(inGameName: string) {
    return this.vips.find((vip) => vip.id === inGameName);
  }

  public listVIPs() {
    // Sort VIPs by expiration date (ascending)
    return this.vips.sort(
      (a, b) => a.expiresAt.getTime() - b.expiresAt.getTime()
    );
  }
}
