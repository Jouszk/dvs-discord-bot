export interface CronTask {
  name: string;
  time: string;
  commands: string;
}

export interface SocketData {
  Message: string;
  Identifier: number;
  Type: "Generic" | "Chat";
  Stacktrace?: string;
}

export interface ItemSpawn {
  item: string;
  amount: number;
  receiver: string;
}

export interface NoteEdit {
  username: string;
  oldContent: string;
  newContent: string;
}

export interface RCERole {
  inGameName: string;
  role: string;
}

export interface ChatMessage {
  Channel: number;
  Message: string;
  UserId: number;
  Username: string;
  Color: string;
  Time: number;
}

export interface KillMessage {
  attacker: string;
  victim: string;
}

export interface KeyPreset {
  name: string;
  commands: string[];
}
