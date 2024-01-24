import { Command, ApplicationCommandRegistry } from "@sapphire/framework";
import { CommandInteraction, AttachmentBuilder } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import {
  CanvasRenderingContext2D,
  loadImage,
  registerFont,
  Canvas,
  Image,
  createCanvas,
} from "canvas";
import { join } from "path";
import { XP_SYSTEM_CONFIG } from "../../vars";
import XPUtils from "../../util/XPUtils";

@ApplyOptions<Command.Options>({
  name: "rank",
  description: "View a users rank in the server",
})
export class RankCommand extends Command {
  public override registerApplicationCommands(
    registry: ApplicationCommandRegistry
  ) {
    registry.registerChatInputCommand(
      (x) =>
        x
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((c) =>
            c
              .setName("user")
              .setDescription("The user to view a rank of")
              .setRequired(false)
          ),
      { idHints: [] }
    );
  }

  public async chatInputRun(interaction: CommandInteraction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const data = await XPUtils.getRank(user);

    if (!data) {
      return interaction.reply({
        content: "This user does not have a rank",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const assetsDirectory = join(__dirname, "..", "..", "..", "assets");

    // Overlay
    const overlayCanvas: Canvas = createCanvas(1000, 333);
    const overlayCtx: CanvasRenderingContext2D = overlayCanvas.getContext("2d");
    const overlayImage: Image = await loadImage(
      `${assetsDirectory}/rankBehiveOverlay.png`
    );
    overlayCtx.save();
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    overlayCtx.drawImage(
      overlayImage,
      0,
      0,
      overlayCanvas.width,
      overlayCanvas.height
    );
    overlayCtx.fillStyle = "#de2121";
    overlayCtx.globalCompositeOperation = "source-atop";
    overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    overlayCtx.restore();

    const canvas: Canvas = createCanvas(1000, 333);
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

    // Register Fonts
    await registerFont(`${assetsDirectory}/Roboto-Black.ttf`, {
      family: "Roboto-Black",
    });
    await registerFont(`${assetsDirectory}/Roboto-BoldItalic.ttf`, {
      family: "Roboto-BoldItalic",
    });
    await registerFont(`${assetsDirectory}/Roboto-Light.ttf`, {
      family: "Roboto-Light",
    });
    await registerFont(`${assetsDirectory}/Roboto-LightItalic.ttf`, {
      family: "Roboto-LightItalic",
    });
    await registerFont(`${assetsDirectory}/Roboto-Medium.ttf`, {
      family: "Roboto-Medium",
    });

    // Background
    const background: Image = await loadImage(
      `${assetsDirectory}/rankDefaultBackground.png`
    );
    const overlay: Image = await loadImage(overlayCanvas.toBuffer());

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);

    // XP Bar
    ctx.beginPath();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#000000";
    this.roundedRectangle(ctx, 85, 235, 686, 35, 10);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";
    this.roundedRectangle(ctx, 85, 235, 686, 35, 10);
    ctx.stroke();
    ctx.closePath();

    // XP Bar - Progress
    ctx.beginPath();
    ctx.fillStyle = "#de2121";
    ctx.globalAlpha = 0.6;
    this.roundedRectangle(
      ctx,
      85,
      235,
      (100 / (data.level * XP_SYSTEM_CONFIG.xpRequiredByLevel)) *
        data.xp *
        6.86,
      35,
      10
    );
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.closePath();

    // XP Bar - Text
    ctx.beginPath();
    ctx.font = "24px Roboto-Light";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      `${data.xp} / ${data.level * XP_SYSTEM_CONFIG.xpRequiredByLevel} XP`,
      440,
      262
    );
    ctx.closePath();

    // Level Text
    ctx.beginPath();
    ctx.font = "22px Roboto-Black";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(data.level.toString(), 114, 295);
    ctx.fillText((Number(data.level) + 1).toString(), 710, 295);
    ctx.closePath();

    // Username Text
    ctx.beginPath();
    ctx.font = "40px Roboto-Medium";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(user.tag, 100, 220);
    ctx.closePath();

    // Rank Text
    ctx.beginPath();
    ctx.font = "30px Roboto-Black";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("RANK", 100, 80);
    ctx.font = "40px Roboto-LightItalic";
    ctx.fillText(`#${data.rank}`, ctx.measureText("RANK").width + 90, 80);
    ctx.closePath();

    // Avatar
    const avatar: Image = await loadImage(
      user.displayAvatarURL({
        extension: "jpeg",
        size: 1024,
        forceStatic: true,
      })
    );

    ctx.beginPath();
    ctx.arc(826, 166, 120, 0, Math.PI * 2, true);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 705, 45, 242, 242);

    // Generate PNG and send
    const attachment = new AttachmentBuilder(canvas.toBuffer(), {
      name: "rank.png",
    });
    return interaction.editReply({
      files: [attachment],
    });
  }

  private roundedRectangle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    rounded: number
  ) {
    const halfRadians: number = (2 * Math.PI) / 2;
    const quarterRadians: number = (2 * Math.PI) / 4;

    ctx.arc(
      rounded + x,
      rounded + y,
      rounded,
      -quarterRadians,
      halfRadians,
      true
    );
    ctx.lineTo(x, y + height - rounded);
    ctx.arc(
      rounded + x,
      height - rounded + y,
      rounded,
      halfRadians,
      quarterRadians,
      true
    );
    ctx.lineTo(x + width - rounded, y + height);
    ctx.arc(
      x + width - rounded,
      y + height - rounded,
      rounded,
      quarterRadians,
      0,
      true
    );
    ctx.lineTo(x + width, y + rounded);
    ctx.arc(
      x + width - rounded,
      y + rounded,
      rounded,
      0,
      -quarterRadians,
      true
    );
    ctx.lineTo(x + rounded, y);
  }
}
