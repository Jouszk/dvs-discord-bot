import { Guild, Collection } from "discord.js";
import type { PrismaClient } from "@prisma/client";
import * as _ from "dot-prop";

export class SettingsProvider {
  public items: Collection<string | "global", Object>;
  public prisma: PrismaClient;

  public constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.items = new Collection();
  }

  public async init(): Promise<void> {
    const settings = await this.prisma.setting.findMany();

    for (const setting of settings) {
      this.items.set(setting.id.toString(), setting.settings);
    }
  }

  public get<T>(guild: string | Guild, key: string, defaultValue: T): T {
    const id = (this.constructor as typeof SettingsProvider).getGuildId(guild);

    if (this.items.has(id)) {
      return _.get(this.items.get(id), key, defaultValue);
    }

    return defaultValue;
  }

  public getRaw(guild: string | Guild) {
    const id = (this.constructor as typeof SettingsProvider).getGuildId(guild);
    return this.items.has(id) ? this.items.get(id) : null;
  }

  public set(guild: string | Guild, key: string, value: any) {
    const id = (this.constructor as typeof SettingsProvider).getGuildId(guild);
    const data = this.items.get(id) || {};
    _.set(data, key, value);
    this.items.set(id, data);

    return this.updateData(id, data);
  }

  public delete(guild: string | Guild, key: string) {
    const id = (this.constructor as typeof SettingsProvider).getGuildId(guild);
    const data = this.items.get(id) || {};
    _.delete(data, key);

    return this.updateData(id, data);
  }

  public clear(guild: string | Guild) {
    const id = (this.constructor as typeof SettingsProvider).getGuildId(guild);
    this.items.delete(id);

    return this.deleteData(id);
  }

  private static getGuildId(guild: string | Guild): string {
    if (guild instanceof Guild) return guild.id;
    if (guild === "global" || !guild) return "0";
    if (typeof guild === "string" && /^\d+$/.test(guild)) return guild;
    throw new TypeError(
      "Invalid guild specified. Must be a Guild instance, guild ID, 'global' or null."
    );
  }

  private async deleteData(id: string) {
    return await this.prisma.setting.delete({ where: { id } });
  }

  private async updateData(id: string, data: any) {
    await this.prisma.setting.upsert({
      where: { id },
      create: {
        id,
        settings: data,
      },
      update: { settings: data },
    });
  }
}
