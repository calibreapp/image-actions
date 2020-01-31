const util = require("util");
const fs = require("fs").promises;
const path = require("path");
const glob = util.promisify(require("glob"));
const sharp = require("sharp");

const getConfig = require("./config");

const {
  REPO_DIRECTORY,
  EXTENSION_TO_SHARP_FORMAT_MAPPING,
  FILE_EXTENSIONS_TO_PROCESS
} = require("./constants");

const printSharpInfo = () => {
  console.log("=== Sharp library info ===");
  console.log(sharp.versions);
  console.log(sharp.format);
  console.log("=== Sharp library info ===");
};

const processImages = async () => {
  printSharpInfo();

  const config = await getConfig();
  const globPaths = `${REPO_DIRECTORY}/**/*.{${FILE_EXTENSIONS_TO_PROCESS.join(
    ","
  )}}`;

  const imagePaths = await glob(globPaths, {
    ignore: config.ignorePaths.map(p => path.resolve(REPO_DIRECTORY, p)),
    nodir: true
  });

  const images = [];

  for await (const imgPath of imagePaths) {
    const extension = path.extname(imgPath);
    const sharpFormat = EXTENSION_TO_SHARP_FORMAT_MAPPING[extension];
    const options = config[sharpFormat];
    const beforeStats = (await fs.stat(imgPath)).size;

    try {
      const { data, info } = await sharp(imgPath)
        .toFormat(sharpFormat, options)
        .toBuffer({ resolveWithObject: true });

      console.log(
        "    - Processing:",
        imgPath,
        JSON.stringify(options),
        JSON.stringify(info)
      );

      await fs.writeFile(imgPath, data);

      // Remove the /github/home/ path (including the slash)
      const name = imgPath.replace(REPO_DIRECTORY, "").replace(/\//, "");
      const afterStats = info.size;
      const percentChange = (afterStats / beforeStats) * 100 - 100;

      // Add a flag to tell if the optimisation was worthwhile
      const compressionWasSignificant = percentChange < -1;

      images.push({
        name,
        path: imgPath,
        beforeStats,
        afterStats,
        percentChange,
        compressionWasSignificant
      });
    } catch (e) {
      console.error("::error:: ", e, imgPath);
      continue;
    }
  }

  const metrics = await calculateOverallMetrics(images);

  return {
    images,
    metrics
  };
};

const calculateOverallMetrics = async images => {
  let bytesBeforeCompression = 0;
  let bytesAfterCompression = 0;

  for await (const image of images) {
    if (image.compressionWasSignificant) {
      bytesBeforeCompression += image.beforeStats;
      bytesAfterCompression += image.afterStats;
    }
  }

  const bytesSaved = bytesBeforeCompression - bytesAfterCompression;
  const percentChange =
    (bytesAfterCompression / bytesBeforeCompression) * 100 - 100;

  return {
    bytesSaved,
    percentChange
  };
};

module.exports = processImages;
