export interface Server {
  id: string;
  game: string;
  name: string;
  features: string[];
  logo: string;
  ipAddress: string;
  rconPort: number;
  ftpPassword: string;
  connected: boolean;
  serverId: number;
  region: "US" | "EU";
  pvp: boolean;
  maxPop: number;
}

export const servers: Server[] = [
  {
    id: "server1",
    game: "Rust Console Edition",
    name: "DvS NO TEAM-LIMIT",
    logo: `https://dvs.gg/img/rust-console.png`,
    features: [
      "BiWeekly Wipe Schedule",
      "2x Gather & Loot",
      "Instant Crafting & Recycling",
      "Active Admins & Events",
      "And More!",
    ],
    ipAddress: "144.126.145.160",
    rconPort: 28716,
    ftpPassword: "7k35QR6W",
    connected: false,
    serverId: 1245755,
    region: "US",
    pvp: false,
    maxPop: 100,
  },
  {
    id: "server2",
    game: "Rust Console Edition",
    name: "DvS Solo/Duo/Trio",
    logo: `https://dvs.gg/img/rust-console.png`,
    features: [
      "BiWeekly Wipe Schedule",
      "3x Gather & Loot",
      "Instant Crafting & Recycling",
      "Active Admins & Events",
      "And More!",
    ],
    ipAddress: "144.126.128.8",
    rconPort: 34616,
    ftpPassword: "FAcnQxSq",
    connected: false,
    serverId: 1395602,
    region: "US",
    pvp: false,
    maxPop: 80,
  },
];
