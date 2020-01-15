const fs = require("fs").promises;

const yaml = require("js-yaml");

const { CONFIG_PATH,
  JPEG_QUALITY,
  PNG_QUALITY,
  WEBP_QUALITY,
  IGNORE_PATHS
} = require("./constants");

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
    jpeg: { quality: JPEG_QUALITY },
    png: { quality: PNG_QUALITY },
    webp: { quality: WEBP_QUALITY },
    ignorePaths: IGNORE_PATHS
  };

  const ymlConfig = await getYamlConfig();
  const config = ymlConfig
    ? Object.assign(defaultConfig, ymlConfig)
    : defaultConfig;

  console.log(
    "->> Checking for config at",
    CONFIG_PATH,
    !ymlConfig ? "Not found" : "Found!"
  );

  if (ymlConfig) {
    console.error("::warning:: Using image-actions.yml for configuration is deprecated. See https://github.com/calibreapp/image-actions for the latest configuration options.");
  }

  console.log("->> Using config:", JSON.stringify(config));

  return config;
};

module.exports = getConfig;
