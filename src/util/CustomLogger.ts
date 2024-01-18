import { ILogger, LogLevel } from "@sapphire/framework";
import { inspect } from "util";

enum ConsoleColor {
  Reset = "\x1b[0m",
  Bright = "\x1b[1m",
  Dim = "\x1b[2m",
  Underscore = "\x1b[4m",
  Blink = "\x1b[5m",
  Reverse = "\x1b[7m",
  Hidden = "\x1b[8m",

  FgBlack = "\x1b[30m",
  FgRed = "\x1b[31m",
  FgGreen = "\x1b[32m",
  FgYellow = "\x1b[33m",
  FgBlue = "\x1b[34m",
  FgMagenta = "\x1b[35m",
  FgCyan = "\x1b[36m",
  FgWhite = "\x1b[37m",

  BgBlack = "\x1b[40m",
  BgRed = "\x1b[41m",
  BgGreen = "\x1b[42m",
  BgYellow = "\x1b[43m",
  BgBlue = "\x1b[44m",
  BgMagenta = "\x1b[45m",
  BgCyan = "\x1b[46m",
  BgWhite = "\x1b[47m",
}

export default class CustomLogger implements ILogger {
  public level: LogLevel;

  public constructor(level: LogLevel) {
    this.level = level;
  }

  private getTimestamp() {
    const date = new Date().toLocaleString("en-GB", {
      timeZone: "Europe/London",
      dateStyle: "long",
    });

    const time = new Date().toLocaleString("en-GB", {
      timeZone: "Europe/London",
      timeStyle: "medium",
    });

    return `${ConsoleColor.BgWhite}${date} ${time}${ConsoleColor.Reset}`;
  }

  private format(content: any) {
    if (typeof content === "string") return content;

    return inspect(content, { depth: 2 });
  }

  public has(level: LogLevel): boolean {
    return level >= this.level;
  }

  public write(level: LogLevel, ...values: readonly unknown[]): void {
    switch (level) {
      case LogLevel.Trace:
        return this.trace(...values);
      case LogLevel.Debug:
        return this.debug(...values);
      case LogLevel.Info:
        return this.info(...values);
      case LogLevel.Warn:
        return this.warn(...values);
      case LogLevel.Error:
        return this.error(...values);
      case LogLevel.Fatal:
        return this.fatal(...values);
    }
  }

  public info(...values: readonly unknown[]) {
    return console.log(
      `${this.getTimestamp()} ${ConsoleColor.BgCyan}INIT${ConsoleColor.Reset} ${
        ConsoleColor.FgCyan
      }${values}${ConsoleColor.Reset}`
    );
  }

  public error(...values: readonly unknown[]) {
    return console.log(
      `${this.getTimestamp()} ${ConsoleColor.BgRed}ERROR${ConsoleColor.Reset} ${
        ConsoleColor.FgRed
      }${this.format(values)}${ConsoleColor.Reset}`
    );
  }

  public debug(...values: readonly unknown[]) {
    return console.log(
      `${this.getTimestamp()} ${ConsoleColor.BgGreen}DEBUG${
        ConsoleColor.Reset
      } ${ConsoleColor.FgGreen}${this.format(values)}${ConsoleColor.Reset}`
    );
  }

  public warn(...values: readonly unknown[]) {
    return console.log(
      `${this.getTimestamp()} ${ConsoleColor.BgYellow}WARN${
        ConsoleColor.Reset
      } ${ConsoleColor.FgYellow}${values}${ConsoleColor.Reset}`
    );
  }

  public fatal(...values: readonly unknown[]): void {
    return console.log(
      `${this.getTimestamp()} ${ConsoleColor.BgRed}FATAL${ConsoleColor.Reset} ${
        ConsoleColor.FgRed
      }${values}${ConsoleColor.Reset}`
    );
  }

  public trace(...values: readonly unknown[]): void {
    return console.log(
      `${this.getTimestamp()} ${ConsoleColor.BgBlue}TRACE${
        ConsoleColor.Reset
      } ${ConsoleColor.FgBlue}${values}${ConsoleColor.Reset}`
    );
  }

  public cmd(command: string, user: string) {
    return console.log(
      `${this.getTimestamp()} ${ConsoleColor.BgMagenta}CMD${
        ConsoleColor.Reset
      } ${ConsoleColor.FgMagenta}${command}${ConsoleColor.Reset} executed by ${
        ConsoleColor.FgMagenta
      }${user}${ConsoleColor.Reset}`
    );
  }

  public api(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    endpoint: string,
    address: string
  ) {
    return console.log(
      `${this.getTimestamp()} ${ConsoleColor.BgYellow}API${
        ConsoleColor.Reset
      } ${ConsoleColor.FgYellow}${method} ${endpoint}${
        ConsoleColor.Reset
      } accessed from ${ConsoleColor.FgYellow}${address}${ConsoleColor.Reset}`
    );
  }
}

declare module "@sapphire/framework" {
  interface ILogger {
    cmd(command: string, user: string): void;
    api(
      method: "GET" | "POST" | "PATCH" | "DELETE",
      endpoint: string,
      address: string
    ): void;
  }
}
