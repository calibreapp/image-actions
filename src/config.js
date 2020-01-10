const fs = require("fs").promises;

const yaml = require("js-yaml");

const { CONFIG_PATH } = require("./constants");

const getYamlConfig = async () => {
  try {
    const text = await fs.readFile(CONFIG_PATH);
    return yaml.safeLoad(text);
  } catch (err) {
    console.error(CONFIG_PATH, "not found", err);
    return undefined;
  }
};

const getConfig = async () => {
  const defaultConfig = {
    jpeg: { quality: 80 },
    png: { quality: 80 },
    webp: { quality: 80 },
    ignorePaths: ["node_modules/**"],
    significantCompressionPercent: 1
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

  console.log("->> Using config:", JSON.stringify(config));

  return config;
};

module.exports = getConfig;
