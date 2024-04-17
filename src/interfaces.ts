export interface CronTask {
  serverId: string;
  name: string;
  time: string;
  commands: string;
  permanent: boolean;
}

export interface SocketData {
  Message: string;
  Identifier: number;
  Type: "Generic" | "Chat";
  Stacktrace?: string;
}

export interface ServerInfo {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  pvp: boolean;
}

export interface GameEvent {
  event: string;
  server: ServerInfo;
}

export interface TeamData {
  ign: string;
  owner: string;
  teamId: number;
}

export interface TeamEvent {
  team: TeamData;
  server: ServerInfo;
}

export interface ItemSpawn {
  item: string;
  amount: number;
  receiver: string;
}

export interface ItemSpawnEvent {
  spawn: ItemSpawn;
  server: ServerInfo;
}

export interface NoteEdit {
  username: string;
  oldContent: string;
  newContent: string;
}

export interface NoteEditEvent {
  note: NoteEdit;
  server: ServerInfo;
}

export interface PlayerJoinEvent {
  username: string;
  server: ServerInfo;
}

export interface RustAdmin {
  ign: string;
  discord: string;
  owner: boolean;
  chatColor: string;
}

export interface RCERole {
  inGameName: string;
  role: string;
}

export interface RoleEvent {
  role: RCERole;
  server: ServerInfo;
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

export interface KillEvent {
  kill: KillMessage;
  server: ServerInfo;
}

export interface KeyPreset {
  name: string;
  commands: string[];
}

export interface SellixTransaction {
  id: number;
  uniqid: string;
  total: number;
  total_display: number;
  exchange_rate: number;
  currency: string;
  shop_id: number;
  type: "PRODUCT" | "SUBSCRIPTION";
  customer_email: string;
  product_id: string;
  product_title: string;
  quantity: number;
  status: "PENDING" | "COMPLETED" | "REFUNDED";
  created_at: number;
  day_value: number;
  day: string;
  month: string;
  year: number;
}
