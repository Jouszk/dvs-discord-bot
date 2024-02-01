import { KeyPreset } from "./interfaces";

export const RUST_ADMINS = [
  "b1nzeee",
  "Saucey Hub",
  "HANDMEYOURGUN",
  "SixtyFatGuys",
];

export enum RCEEventType {
  ChatMessage = "rce-chat-message",
  WebSocketMessage = "rce-ws-message",
  KillMessage = "rce-kill-message",
  ItemSpawnMessage = "rce-item-spawn-message",
  EventMessage = "rce-event-message",
  AddRole = "rce-add-role",
  NoteEdit = "rce-note-edit",
}

export const ignoredAttacker = [
  "thirst",
  "hunger",
  "guntrap.deployed",
  "pee pee 9000",
  "barricade.wood",
  "wall.external.high.stone",
  "wall.external.high",
  "gates.external.high.wood",
  "gates.external.high.stone",
  "gates.external.high.stone (entity)",
  "bear",
  "autoturret_deployed",
  "cold",
  "bleeding",
  "boar",
  "wolf",
  "fall",
  "drowned",
  "radiation",
  "autoturret_deployed (entity)",
  "bear (bear)",
  "boar (boar)",
  "wolf (wolf)",
  "guntrap.deployed (entity)",
  "fall!",
  "lock.code (entity)",
  "bradleyapc (entity)",
  "wall.external.high.stone (entity)",
  "barricade.metal (entity)",
  "spikes.floor (entity)",
  "sentry.bandit.static (entity)",
  "cactus-7 (entity)",
  "cactus-6 (entity)",
  "cactus-5 (entity)",
  "cactus-4 (entity)",
  "cactus-3 (entity)",
  "cactus-2 (entity)",
  "cactus-1 (entity)",
  "landmine (entity)",
  "wall.external.high.wood (entity)",
  "sentry.scientist.static (entity)",
  "patrolhelicopter (entity)",
  "flameturret.deployed (entity)",
  "oilfireballsmall (entity)",
];

// {username} - The username of the user who redeemed the key
export const keyPresets: KeyPreset[] = [
  {
    name: "Add VIP",
    commands: ['VIPID "{username}"'],
  },
  {
    name: "Add VIP Plus",
    commands: ['VIPID "{username}"', 'kit givetoplayer t3base "{username}"'],
  },
  {
    name: "Tier 1 Raid Insurance",
    commands: ['kit givetoplayer ins "{username}"'],
  },
  {
    name: "Tier 2 Raid Insurance",
    commands: ['kit givetoplayer vipins "{username}"'],
  },
  {
    name: "Tier 1 Base Pack",
    commands: ['kit givetoplayer t1base "{username}"'],
  },
  {
    name: "Tier 2 Base Pack",
    commands: ['kit givetoplayer t2base "{username}"'],
  },
  {
    name: "Tier 3 Base Pack",
    commands: ['kit givetoplayer t3base "{username}"'],
  },
  {
    name: "Tier 1 Kit",
    commands: ['kit givetoplayer t1kit "{username}"'],
  },
  {
    name: "Tier 2 Kit",
    commands: ['kit givetoplayer t2kit "{username}"'],
  },
  {
    name: "Tier 3 Kit",
    commands: ['kit givetoplayer t3kit "{username}"'],
  },
];

interface RankRoles {
  level: number;
  roleId: string;
}

interface XPSystemConfig {
  xpRequiredByLevel: number;
  rankRoles: RankRoles[];
}

export const XP_SYSTEM_CONFIG: XPSystemConfig = {
  xpRequiredByLevel: 35,
  rankRoles: [
    {
      level: 10,
      roleId: "1199798059727593562",
    },
    {
      level: 25,
      roleId: "1199798146352549909",
    },
    {
      level: 40,
      roleId: "1199798227931770950",
    },
  ],
};
