const util = require("util");
const fs = require("fs").promises;
const path = require("path");
const glob = util.promisify(require("glob"));
const sharp = require("sharp");

const getConfig = require("./config");

const {
  REPO_DIRECTORY,
  EXTENSION_TO_SHARP_FORMAT_MAPPING
} = require("./constants");

const processImages = async () => {
  const config = await getConfig();
  const imagePaths = await glob(`${REPO_DIRECTORY}/**/*.{jpg,png}`, {
    ignore: config.ignorePaths.map(p => path.resolve(REPO_DIRECTORY, p)),
    nodir: true
  });

  const imageStats = [];

  for await (const imgPath of imagePaths) {
    const extension = path.extname(imgPath);
    const sharpFormat = EXTENSION_TO_SHARP_FORMAT_MAPPING[extension];
    const options = config[sharpFormat].options;
    const beforeStats = (await fs.stat(imgPath)).size;
    console.log("    - Processing:", imgPath);

    const processedImageBuffer = await sharp(imgPath)
      .toFormat(sharpFormat, options)
      .toBuffer();

    await fs.writeFile(imgPath, processedImageBuffer);

    const name = imgPath.replace(REPO_DIRECTORY, "");
    const afterStats = (await fs.stat(imgPath)).size;
    const percentChange = (afterStats / beforeStats) * 100 - 100;

    // Add a flag to tell if the optimisation was worthwhile
    const compressionWasSignificant = percentChange < 0;

    imageStats.push({
      name,
      path: imgPath,
      beforeStats,
      afterStats,
      percentChange,
      compressionWasSignificant
    });
  }

  return imageStats;
};

module.exports = processImages;
