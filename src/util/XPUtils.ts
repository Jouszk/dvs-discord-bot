import { container } from "@sapphire/framework";
import { type User } from "discord.js";
import { XP_SYSTEM_CONFIG } from "../vars";
import type { XPSystem } from "@prisma/client";

const handleRankRoles = async (user: User, level: number) => {
  const member = await container.client.guilds.cache
    .first()
    .members.fetch(user.id)
    .catch(() => null);

  if (member) {
    const rankRoles = XP_SYSTEM_CONFIG.rankRoles
      .filter(
        (rankRole) =>
          rankRole.level < level && !member.roles.cache.has(rankRole.roleId)
      )
      .map((rankRole) => rankRole.roleId);

    if (rankRoles.length) {
      await member.roles.add([...new Set(rankRoles)]);
    }
  }
};

interface RankData extends XPSystem {
  rank: number;
}

export default class XPUtils {
  public static async getRank(user: User): Promise<RankData | null> {
    const data = await container.db.xPSystem.findMany({
      orderBy: {
        totalXp: "desc",
      },
    });

    if (!data.length) return null;

    const rank = data.map((e) => e.id).indexOf(user.id) + 1;
    const userData = data[rank - 1];

    return userData ? { rank, ...userData } : null;
  }

  public static async updateXp(user: User): Promise<XPSystem> {
    const randomXp = Math.floor(Math.random() * 16) + 1;

    // Get current data or default data
    const data = (await container.db.xPSystem.findFirst({
      where: {
        id: user.id,
      },
    })) || {
      id: user.id,
      level: 1,
      xp: 0,
      totalXp: 0,
    };

    // XP required to level up
    const requiredXp =
      data.level * XP_SYSTEM_CONFIG.xpRequiredByLevel - data.xp;
    const xpToGive = randomXp > requiredXp ? requiredXp : randomXp;

    // Update XP
    data.totalXp = data.totalXp + xpToGive;
    data.xp = data.xp + xpToGive;

    // Level up
    if (data.xp >= data.level * XP_SYSTEM_CONFIG.xpRequiredByLevel) {
      data.level++;
      data.xp = 0;

      await handleRankRoles(user, data.level);
    }

    // Update database
    await container.db.xPSystem.upsert({
      where: {
        id: user.id,
      },
      create: data,
      update: data,
    });

    return data;
  }
}
