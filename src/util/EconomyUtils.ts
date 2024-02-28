import { createCanvas, loadImage } from "canvas";
import { join } from "path";

const SLOTS_WIN_PROBABILITY = 0.2;

export const FRUIT_VALUES = {
  "🍒": 1,
  "🍊": 1.1,
  "🍋": 1.3,
  "🍎": 1.5,
  "🍉": 2,
  "🍇": 2.5,
  "🍓": 3,
};
export const FRUITS = Object.keys(FRUIT_VALUES);

interface RouletteNumbers {
  number: number;
  color: "green" | "red" | "black";
  rotation: number;
}

export const ROULETTE_NUMBERS: RouletteNumbers[] = [
  {
    number: 0,
    color: "green",
    rotation: 0,
  },
  {
    number: 32,
    color: "red",
    rotation: -9.7,
  },
  {
    number: 15,
    color: "black",
    rotation: -19.4,
  },
  {
    number: 19,
    color: "red",
    rotation: -29.1,
  },
  {
    number: 4,
    color: "black",
    rotation: -38.8,
  },
  {
    number: 21,
    color: "red",
    rotation: -48.5,
  },
  {
    number: 2,
    color: "black",
    rotation: -58.2,
  },
  {
    number: 25,
    color: "red",
    rotation: -67.9,
  },
  {
    number: 17,
    color: "black",
    rotation: -77.6,
  },
  {
    number: 34,
    color: "red",
    rotation: -87.3,
  },
  {
    number: 6,
    color: "black",
    rotation: -97,
  },
  {
    number: 27,
    color: "red",
    rotation: -106.7,
  },
  {
    number: 13,
    color: "black",
    rotation: -116.4,
  },
  {
    number: 36,
    color: "red",
    rotation: -126.1,
  },
  {
    number: 11,
    color: "black",
    rotation: -135.8,
  },
  {
    number: 30,
    color: "red",
    rotation: -145.5,
  },
  {
    number: 8,
    color: "black",
    rotation: -155.2,
  },
  {
    number: 23,
    color: "red",
    rotation: -164.9,
  },
  {
    number: 10,
    color: "black",
    rotation: -174.6,
  },
  {
    number: 5,
    color: "red",
    rotation: -184.3,
  },
  {
    number: 24,
    color: "black",
    rotation: -194,
  },
  {
    number: 16,
    color: "red",
    rotation: -203.7,
  },
  {
    number: 33,
    color: "black",
    rotation: -213.4,
  },
  {
    number: 1,
    color: "red",
    rotation: -223.1,
  },
  {
    number: 20,
    color: "black",
    rotation: -232.8,
  },
  {
    number: 14,
    color: "red",
    rotation: -242.5,
  },
  {
    number: 31,
    color: "black",
    rotation: -252.2,
  },
  {
    number: 9,
    color: "red",
    rotation: -261.9,
  },
  {
    number: 22,
    color: "black",
    rotation: -271.6,
  },
  {
    number: 18,
    color: "red",
    rotation: -281.3,
  },
  {
    number: 29,
    color: "black",
    rotation: -291,
  },
  {
    number: 7,
    color: "red",
    rotation: -300.7,
  },
  {
    number: 28,
    color: "black",
    rotation: -310.4,
  },
  {
    number: 12,
    color: "red",
    rotation: -320.1,
  },
  {
    number: 35,
    color: "black",
    rotation: -329.8,
  },
  {
    number: 3,
    color: "red",
    rotation: -339.5,
  },
  {
    number: 26,
    color: "black",
    rotation: 9.72,
  },
];

export default class EconomyUtils {
  public static checkSlotsWin(grid: string[][]) {
    for (let i = 0; i < 3; i++) {
      if (grid[i][0] === grid[i][1] && grid[i][1] === grid[i][2]) {
        return grid[i][0];
      }
    }

    for (let j = 0; j < 3; j++) {
      if (grid[0][j] === grid[1][j] && grid[1][j] === grid[2][j]) {
        return grid[0][j];
      }
    }

    if (grid[0][0] === grid[1][1] && grid[1][1] === grid[2][2]) {
      return grid[0][0];
    }
    if (grid[0][2] === grid[1][1] && grid[1][1] === grid[2][0]) {
      return grid[0][2];
    }

    return null;
  }

  public static generateSlotsGrid(): string[][] {
    const grid = [];
    const won = Math.random() < SLOTS_WIN_PROBABILITY;

    if (won) {
      const ranomRowIndex = Math.floor(Math.random() * 3);

      for (let i = 0; i < 3; i++) {
        const row = [];

        for (let j = 0; j < 3; j++) {
          row.push(FRUITS[Math.floor(Math.random() * FRUITS.length)]);
        }

        if (i === ranomRowIndex) {
          const winFruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
          row[0] = winFruit;
          row[1] = winFruit;
          row[2] = winFruit;
        }

        grid.push(row);
      }
    } else {
      for (let i = 0; i < 3; i++) {
        const row = [];

        for (let j = 0; j < 3; j++) {
          row.push(FRUITS[Math.floor(Math.random() * FRUITS.length)]);
        }

        grid.push(row);
      }
    }

    return grid;
  }

  public static async generateRouletteImage(winningNumber: number) {
    const background = await loadImage(
      join(__dirname, "..", "..", "assets", "roulette.png")
    );

    const canvas = createCanvas(background.width, 150);
    const ctx = canvas.getContext("2d");

    const rotationNumber = ROULETTE_NUMBERS.find(
      (rouletteNumber) => rouletteNumber.number === winningNumber
    ).rotation;

    ctx.save();

    ctx.translate(background.width / 2, background.height / 2);
    ctx.rotate((rotationNumber * Math.PI) / 180);
    ctx.translate(-background.width / 2, -background.height / 2);

    ctx.drawImage(background, 0, 0, background.width, background.height);

    ctx.restore();

    ctx.beginPath();
    ctx.arc(canvas.width / 2, 90, 7, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();

    return canvas.toBuffer();
  }
}
