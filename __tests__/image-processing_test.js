const path = require("path");
const fs = require("fs").promises;

const EXAMPLE_IMAGES_DIR = `${process.cwd()}/__tests__/example-images`;
const TMP_TEST_IMAGES_DIR = `${process.cwd()}/__tests__/test-images`;

const EXAMPLE_IMAGES = [
  "roo.webp",
  "roo.jpg",
  "icon.png",
  "optimised-image.png"
];

beforeEach(async () => {
  try {
    await fs.mkdir(TMP_TEST_IMAGES_DIR);
  } catch (e) {
    console.log(TMP_TEST_IMAGES_DIR, "already exists");
  }

  // Copy in reference images for stats
  for await (const image of EXAMPLE_IMAGES) {
    await fs.copyFile(
      path.join(EXAMPLE_IMAGES_DIR, image),
      path.join(TMP_TEST_IMAGES_DIR, image)
    );
  }
});

afterEach(async () => {
  for await (const image of EXAMPLE_IMAGES) {
    await fs.unlink(path.join(TMP_TEST_IMAGES_DIR, image));
  }
  await fs.rmdir(TMP_TEST_IMAGES_DIR);
});

const imageProcessing = require("../src/image-processing");

test("returns metrics for images", async () => {
  const results = await imageProcessing();

  expect(results.metrics).toEqual({
    bytesSaved: 259725,
    percentChange: -53.11697288984146
  });
});

test("returns images with stats", async () => {
  const results = await imageProcessing();

  expect(results.images).toEqual([
    {
      afterStats: 3361,
      beforeStats: 8914,
      compressionWasSignificant: true,
      name: "icon.png",
      path: "__tests__/test-images/icon.png",
      percentChange: -62.29526587390622
    },
    {
      afterStats: 3361,
      beforeStats: 3361,
      compressionWasSignificant: false,
      name: "optimised-image.png",
      path: "__tests__/test-images/optimised-image.png",
      percentChange: 0
    },
    {
      afterStats: 485759,
      beforeStats: 468895,
      compressionWasSignificant: false,
      name: "roo.jpg",
      path: "__tests__/test-images/roo.jpg",
      percentChange: 3.596540803378147
    },
    {
      afterStats: 225882,
      beforeStats: 480054,
      compressionWasSignificant: true,
      name: "roo.webp",
      path: "__tests__/test-images/roo.webp",
      percentChange: -52.94654351385469
    }
  ]);
});
