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
    ipAddress: "45.137.246.96",
    rconPort: 28516,
    ftpPassword: "7k35QR6W",
    connected: false,
  },
  {
    id: "server2",
    game: "Rust Console Edition",
    name: "DvS 1-6 Player Server",
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
  },
];
