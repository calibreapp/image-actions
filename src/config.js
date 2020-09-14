const fs = require("fs").promises;

const yaml = require("js-yaml");

const {
  CONFIG_PATH,
  JPEG_QUALITY,
  JPEG_PROGRESSIVE,
  PNG_QUALITY,
  WEBP_QUALITY,
  IGNORE_PATHS,
  COMPRESS_ONLY
} = require("./constants");

// Deprecated configuration method
const getYamlConfig = async () => {
  try {
    const text = await fs.readFile(CONFIG_PATH);
    return yaml.safeLoad(text);
  } catch (err) {
    return undefined;
  }
};

const getConfig = async () => {
  const defaultConfig = {
    jpeg: { quality: JPEG_QUALITY, progressive: JPEG_PROGRESSIVE },
    png: { quality: PNG_QUALITY },
    webp: { quality: WEBP_QUALITY },
    ignorePaths: IGNORE_PATHS,
    compressOnly: COMPRESS_ONLY
  };

  const ymlConfig = await getYamlConfig();
  const config = ymlConfig
    ? Object.assign(defaultConfig, ymlConfig)
    : defaultConfig;

  if (ymlConfig) {
    console.error(
      "::warning:: Using image-actions.yml for configuration is deprecated. See https://github.com/calibreapp/image-actions for the latest configuration options."
    );
  }

  console.log("->> Using config:", JSON.stringify(config));

  return config;
};

module.exports = getConfig;
