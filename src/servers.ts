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
    ipAddress: "144.126.145.160",
    rconPort: 28716,
    ftpPassword: "7k35QR6W",
    connected: false,
  },
];
