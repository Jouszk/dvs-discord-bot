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
  {
    display: "VIP Plus",
    value: "VIP_PLUS",
  },
];

export const RUST_ADMINS: RustAdmin[] = [
  {
    ign: "b1nzeee",
    discord: "581235801900318741",
    owner: true,
    chatColor: "#48dbfb",
  },
  {
    ign: "Saucey Hub",
    discord: "1005186019391442944",
    owner: true,
    chatColor: "#FFA500",
  },
  {
    ign: "Sixty Fat Guys",
    discord: "980202628384432248",
    owner: true,
    chatColor: "#f1c40f",
  },
  {
    ign: "HANDMEYOURGUN",
    discord: "731466813854187520",
    owner: false,
    chatColor: "#ee5253",
  },
  {
    ign: "Drippen Pain",
    discord: "544652628328710144",
    owner: false,
    chatColor: "#ff0000",
  },
  {
    ign: "sirenqxy",
    discord: "270305277297950730",
    owner: false,
    chatColor: "#ff0000",
  },
  {
    ign: "chemosha",
    discord: "569467126981722112",
    owner: false,
    chatColor: "#81007F",
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
  {
    id: 6,
    name: "Tier 2 Base Pack",
    price: 5,
    commands: ['kit givetoplayer t2base "{username}"'],
  },
  {
    id: 7,
    name: "Tier 3 Base Pack",
    price: 15,
    commands: ['kit givetoplayer t3base "{username}"'],
  },
  {
    id: 8,
    name: "Tier 1 Kit Pack",
    price: 1,
    commands: ['kit givetoplayer t1kit "{username}"'],
  },
  {
    id: 10,
    name: "Tier 2 Kit Pack",
    price: 3,
    commands: ['kit givetoplayer t2kit "{username}"'],
  },
  {
    id: 12,
    name: "Tier 3 Kit Pack",
    price: 5,
    commands: ['kit givetoplayer t3kit "{username}"'],
  },
  {
    id: 9,
    name: "Tier 1 Prototype Kit",
    price: 1,
    commands: ['kit givetoplayer t1kit-proto "{username}"'],
  },
  {
    id: 11,
    name: "Tier 2 M4 Shotgun Kit",
    price: 3,
    commands: ['kit givetoplayer t2kit-m4 "{username}"'],
  },
  {
    id: 13,
    name: "Night OP Kit",
    price: 7,
    commands: ['kit givetoplayer nightop "{username}"'],
  },
  {
    id: 16,
    name: "Test-Gen Turret Bundle",
    price: 32,
    commands: ['kit givetoplayer turretgen "{username}"'],
  },
];

// {username} - The username of the user who redeemed the key
export const keyPresets: KeyPreset[] = [
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
    name: "Tier 1 Kit - Thompson",
    commands: ['kit givetoplayer t1kit "{username}"'],
  },
  {
    name: "Tier 1 Kit - Prototype 17",
    commands: ['kit givetoplayer t1kit-proto "{username}"'],
  },
  {
    name: "Tier 2 Kit - MP5A4",
    commands: ['kit givetoplayer t2kit "{username}"'],
  },
  {
    name: "Tier 2 Kit - M4 Shotgun",
    commands: ['kit givetoplayer t2kit-m4 "{username}"'],
  },
  {
    name: "Tier 3 Kit",
    commands: ['kit givetoplayer t3kit "{username}"'],
  },
  {
    name: "Night OP Kit",
    commands: ['kit givetoplayer nightop "{username}"'],
  },
  {
    name: "Test-Gen Turret Bundle",
    commands: ['kit givetoplayer turretgen "{username}"'],
  },
  {
    name: "Box of Charcoal",
    commands: ['inventory.giveto "{username}" "charcoal" 144000'],
  },
  {
    name: "Box of Metal Fragments",
    commands: ['inventory.giveto "{username}" "metal.fragments" 144000'],
  },
  {
    name: "Box of Wood",
    commands: ['inventory.giveto "{username}" "wood" 144000'],
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
  xpMultiplier: 2,
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
    {
      level: 55,
      roleId: "1225444084458586163",
    },
  ],
};
