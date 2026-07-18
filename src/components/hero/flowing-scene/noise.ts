import type { Vec2 } from "./types";

const SIMPLEX_GRADIENTS: Vec2[] = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function mulberry32(seed: number) {
  return () => {
    let next = (seed += 0x6d2b79f5);
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function buildPermutationTable(seed: number) {
  const random = mulberry32(seed);
  const table = Array.from({ length: 256 }, (_, index) => index);

  for (let index = table.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(random() * (index + 1));
    const current = table[index];
    table[index] = table[nextIndex];
    table[nextIndex] = current;
  }

  return table;
}

function dotProduct(gradient: Vec2, x: number, y: number) {
  return gradient[0] * x + gradient[1] * y;
}

// Simplex skew/unskew factors are constant; hoist them out of the per-sample
// hot path (noise2D runs per vertex per frame across every layer).
const SKEW_FACTOR = 0.5 * (Math.sqrt(3) - 1);
const UNSKEW_FACTOR = (3 - Math.sqrt(3)) / 6;

export class SimplexNoise {
  private readonly permutation: number[];

  constructor(seed: number) {
    const table = buildPermutationTable(seed);
    this.permutation = Array.from(
      { length: 512 },
      (_, index) => table[index & 255],
    );
  }

  noise2D(x: number, y: number) {
    const skew = (x + y) * SKEW_FACTOR;
    const cellX = Math.floor(x + skew);
    const cellY = Math.floor(y + skew);
    const unskew = (cellX + cellY) * UNSKEW_FACTOR;
    const originX = cellX - unskew;
    const originY = cellY - unskew;
    const deltaX = x - originX;
    const deltaY = y - originY;
    const cornerOffsetX = deltaX > deltaY ? 1 : 0;
    const cornerOffsetY = deltaX > deltaY ? 0 : 1;
    const middleX = deltaX - cornerOffsetX + UNSKEW_FACTOR;
    const middleY = deltaY - cornerOffsetY + UNSKEW_FACTOR;
    const farX = deltaX - 1 + 2 * UNSKEW_FACTOR;
    const farY = deltaY - 1 + 2 * UNSKEW_FACTOR;
    const cellIndexX = cellX & 255;
    const cellIndexY = cellY & 255;
    const gradient0 =
      SIMPLEX_GRADIENTS[
        this.permutation[cellIndexX + this.permutation[cellIndexY]] %
          SIMPLEX_GRADIENTS.length
      ];
    const gradient1 =
      SIMPLEX_GRADIENTS[
        this.permutation[
          cellIndexX +
            cornerOffsetX +
            this.permutation[cellIndexY + cornerOffsetY]
        ] % SIMPLEX_GRADIENTS.length
      ];
    const gradient2 =
      SIMPLEX_GRADIENTS[
        this.permutation[cellIndexX + 1 + this.permutation[cellIndexY + 1]] %
          SIMPLEX_GRADIENTS.length
      ];

    let contribution0 = 0.5 - deltaX * deltaX - deltaY * deltaY;
    let contribution1 = 0.5 - middleX * middleX - middleY * middleY;
    let contribution2 = 0.5 - farX * farX - farY * farY;

    if (contribution0 < 0) {
      contribution0 = 0;
    } else {
      const squared = contribution0 * contribution0;
      contribution0 = squared * squared * dotProduct(gradient0, deltaX, deltaY);
    }

    if (contribution1 < 0) {
      contribution1 = 0;
    } else {
      const squared = contribution1 * contribution1;
      contribution1 =
        squared * squared * dotProduct(gradient1, middleX, middleY);
    }

    if (contribution2 < 0) {
      contribution2 = 0;
    } else {
      const squared = contribution2 * contribution2;
      contribution2 = squared * squared * dotProduct(gradient2, farX, farY);
    }

    return 70 * (contribution0 + contribution1 + contribution2);
  }
}
