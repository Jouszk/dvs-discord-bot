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
  limited: boolean;
}

export const servers: Server[] = [
  {
    id: "server1",
    game: "Rust Console Edition",
    name: "DvS Solo/Duo/Trio",
    logo: `${process.env.MAIN_WEBSITE_URL}/img/rust-console.png`,
    features: [
      "BiWeekly Wipe Schedule",
      "3x Gather & Loot",
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
    limited: true,
  },
  {
    id: "server2",
    game: "Rust Console Edition",
    name: "DvS Solo-Quad",
    logo: `${process.env.MAIN_WEBSITE_URL}/img/rust-console.png`,
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
    limited: true,
  },
  {
    id: "server3",
    game: "Rust Console Edition",
    name: "DvS Solo-Only",
    logo: `${process.env.MAIN_WEBSITE_URL}/img/rust-console.png`,
    features: [
      "BiWeekly Wipe Schedule",
      "3x Gather & Loot",
      "Instant Crafting & Recycling",
      "Active Admins & Events",
      "And More!",
    ],
    ipAddress: "144.126.147.110",
    rconPort: 29716,
    ftpPassword: "mcz0Bp17",
    connected: false,
    serverId: 1403404,
    region: "US",
    limited: true,
  },
];
