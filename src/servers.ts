export interface Server {
  id: string;
  game: string;
  name: string;
  features: string[];
  logo: string;
  connected: boolean;
  serverId: number;
  region: "US" | "EU";
  maxPop: number;
  pvp?: boolean;
}

export const servers: Server[] = [
  {
    id: "server1",
    game: "Rust Console Edition",
    name: "DvS Solo/Duo 2x NO TECHTREE",
    logo: `https://dvs.gg/img/rust-console.png`,
    features: [
      "BiWeekly Wipe Schedule",
      "2x Gather & Loot",
      "Instant Crafting & Recycling",
      "Active Admins & Events",
      "And More!",
    ],
    connected: false,
    serverId: 1245755,
    region: "US",
    maxPop: 60,
    pvp: false,
  },
  {
    id: "server2",
    game: "Rust Console Edition",
    name: "DvS Solo/Duo/Trio 3x",
    logo: `https://dvs.gg/img/rust-console.png`,
    features: [
      "BiWeekly Wipe Schedule",
      "3x Gather & Loot",
      "Instant Crafting & Recycling",
      "Active Admins & Events",
      "And More!",
    ],
    connected: false,
    serverId: 1395602,
    region: "US",
    maxPop: 100,
    pvp: false,
  },
  {
    id: "server3",
    game: "Rust Console Edition",
    name: "DvS Solo-Quad 5x",
    logo: `https://dvs.gg/img/rust-console.png`,
    features: [
      "BiWeekly Wipe Schedule",
      "5x Gather & 3x Loot",
      "Instant Crafting & Recycling",
      "Active Admins & Events",
      "And More!",
    ],
    connected: false,
    serverId: 1448247,
    region: "US",
    maxPop: 60,
    pvp: false,
  },
];
