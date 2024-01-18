import { EmbedBuilder } from "discord.js";

declare module "discord.js" {
  interface EmbedBuilder {
    addField(name: string, value: string, inline?: boolean): EmbedBuilder;
    addTitleField(title: string): EmbedBuilder;
    addBlankField(inline?: boolean): EmbedBuilder;
  }
}

EmbedBuilder.prototype.addField = function (
  name: string,
  value: string,
  inline: boolean = false
): EmbedBuilder {
  const fields = this.data.fields || [];

  if (fields.length >= 25) {
    throw new Error("Embeds cannot have more than 25 fields");
  }

  fields.push({ name, value, inline });
  this.data.fields = fields;
  return this;
};

EmbedBuilder.prototype.addTitleField = function (title: string): EmbedBuilder {
  return this.addField("\u200B", `**${title}**`);
};

EmbedBuilder.prototype.addBlankField = function (
  inline: boolean = false
): EmbedBuilder {
  return this.addField("\u200B", "\u200B", inline);
};
