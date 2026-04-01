import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
  optimizeThumbnailBuffer,
  THUMBNAIL_MAX_DIMENSION_PX,
} from "../scripts/process-community-issue.js";

async function createImageBuffer(width, height) {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 31, g: 77, b: 145, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
}

describe("optimizeThumbnailBuffer", () => {
  it("redimensiona imágenes grandes sin deformarlas", async () => {
    const input = await createImageBuffer(2000, 1000);

    const output = await optimizeThumbnailBuffer(input);
    const metadata = await sharp(output).metadata();

    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBe(THUMBNAIL_MAX_DIMENSION_PX);
    expect(metadata.height).toBe(THUMBNAIL_MAX_DIMENSION_PX / 2);
    expect(metadata.width / metadata.height).toBeCloseTo(2, 5);
  });

  it("no amplía imágenes pequeñas", async () => {
    const input = await createImageBuffer(80, 40);

    const output = await optimizeThumbnailBuffer(input);
    const metadata = await sharp(output).metadata();

    expect(metadata.width).toBe(80);
    expect(metadata.height).toBe(40);
  });
});
