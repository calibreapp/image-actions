const { JPEG_QUALITY, 
  PNG_QUALITY, 
  WEBP_QUALITY, 
  IGNORE_PATHS 
} = require("./constants");

const getConfig = async () => {
  const config = {
    jpeg: { quality: JPEG_QUALITY },
    png: { quality: PNG_QUALITY },
    webp: { quality: WEBP_QUALITY },
    ignorePaths: IGNORE_PATHS
  };

  console.log("->> Using config:", JSON.stringify(config));

  return config;
};

module.exports = getConfig;
