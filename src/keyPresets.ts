export interface KeyPreset {
  name: string;
  commands: string[];
}

// {username} - The username of the user who redeemed the key
export const keyPresets: KeyPreset[] = [
  {
    name: "Add VIP",
    commands: ["VIPID {username}"],
  },
  {
    name: "Tier 1 Raid Insurance",
    commands: ["kit givetoplayer ins {username}"],
  },
  {
    name: "Tier 2 Raid Insurance",
    commands: ["kit givetoplayer vipins {username}"],
  },
];
