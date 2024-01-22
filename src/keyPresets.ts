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
  {
    name: "Tier 1 Base Pack",
    commands: ["kit givetoplayer t1base {username}"],
  },
  {
    name: "Tier 2 Base Pack",
    commands: ["kit givetoplayer t2base {username}"],
  },
  {
    name: "Tier 3 Base Pack",
    commands: ["kit givetoplayer t3base {username}"],
  },
  {
    name: "Tier 1 Kit",
    commands: ["kit givetoplayer t1kit {username}"],
  },
  {
    name: "Tier 2 Kit",
    commands: ["kit givetoplayer t2kit {username}"],
  },
  {
    name: "Tier 3 Kit",
    commands: ["kit givetoplayer t3kit {username}"],
  },
];
