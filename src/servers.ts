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
    logo: "",
    features: [
      "BiWeekly Wipe Schedule",
      "2x Gather & Loot",
      "Instant Crafting & Recycling",
      "Active Admins & Events",
      "And More!",
    ],
    connected: false,
    serverId: 0, // Obtained from GPORTAL
    region: "US",
    maxPop: 100,
    pvp: false,
  },
];
