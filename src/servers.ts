export interface Server {
  game: string;
  name: string;
  features: string[];
  logo: string;
}

export const servers: Server[] = [
  {
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
  },
];
