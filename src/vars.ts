import { KeyPreset, RustAdmin } from "./interfaces";

interface VIPPlan {
  display: string;
  value: string;
}

export const VIP_PLANS: VIPPlan[] = [
  {
    display: "VIP Basic",
    value: "VIP_BASIC",
  },
];

export const RUST_ADMINS: RustAdmin[] = [
  {
    ign: "b1nzeee",
    discord: "581235801900318741",
    owner: true,
    chatColor: "#48dbfb",
  },
];

export enum RCEEventType {
  ChatMessage = "rce-chat-message",
  WebSocketMessage = "rce-ws-message",
  KillMessage = "rce-kill-message",
  ItemSpawnMessage = "rce-item-spawn-message",
  EventMessage = "rce-event-message",
  AddRole = "rce-add-role",
  NoteEdit = "rce-note-edit",
  PlayerJoin = "rce-player-join",
  LeftTeam = "rce-left-team",
  JoinedTeam = "rce-joined-team",
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
  "gates.external.high.wood (entity)",
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
  "napalm (entity)",
  "cargoshipdynamic2 (entity)",
  "barricade.wood (entity)",
  "beartrap (entity)",
  "landmine (entity)",
  "cargoshipdynamic1 (entity)",
  "campfire (entity)",
  "barricade.woodwire (entity)",
  "rocket_crane_lift_trigger (entity)",
  "lock.code (entity)",
  "rowboat (entity)",
  "fireball (entity)",
  "teslacoil.deployed (entity)",
];

interface ShopPack {
  id: number;
  name: string;
  price: number;
  commands: string[];
}

export const shopPacks: ShopPack[] = [
  {
    id: 5,
    name: "Tier 1 Base Pack",
    price: 2,
    commands: ['kit givetoplayer t1base "{username}"'],
  },
];

// {username} - The username of the user who redeemed the key
export const keyPresets: KeyPreset[] = [
  {
    name: "Tier 1 Raid Insurance",
    commands: ['kit givetoplayer ins "{username}"'],
  },
  {
    name: "Auto Turret",
    commands: [
      'inventory.giveto "{username}" "autoturret" 1',
      'inventory.giveto "{username}" "ammo.pistol" 128',
      'inventory.giveto "{username}" "pistol.python" 1',
    ],
  },
];

interface RankRoles {
  level: number;
  roleId: string;
}

interface XPSystemConfig {
  xpRequiredByLevel: number;
  xpMultiplier: number;
  rankRoles: RankRoles[];
}

export const XP_SYSTEM_CONFIG: XPSystemConfig = {
  xpRequiredByLevel: 35,
  xpMultiplier: 1,
  rankRoles: [
    {
      level: 10,
      roleId: "",
    },
  ],
};
