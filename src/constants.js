const path = require("path");

const GITHUB_TOKEN = process.env["INPUT_GITHUB_TOKEN"];
const GITHUB_EVENT_NAME = process.env["GITHUB_EVENT_NAME"];
const GITHUB_EVENT_PATH = process.env["GITHUB_EVENT_PATH"];
const GITHUB_SHA = process.env["GITHUB_SHA"];
const GITHUB_REF = process.env["GITHUB_REF"];
const GITHUB_REPOSITORY = process.env["GITHUB_REPOSITORY"];

const REPO_DIRECTORY = process.env["GITHUB_WORKSPACE"];

const JPEG_QUALITY = process.env["INPUT_JPEGQUALITY"];
const PNG_QUALITY = process.env["INPUT_PNGQUALITY"];
const WEBP_QUALITY = process.env["INPUT_WEBPQUALITY"];
const IGNORE_PATHS = process.env["INPUT_IGNOREPATHS"];

const COMMITTER = {
  name: "Calibre",
  email: "hello@calibreapp.com"
};

if (!REPO_DIRECTORY) {
  console.log("::error::There is no GITHUB_WORKSPACE environment variable");
  process.exit(1);
}

const CONFIG_PATH = path.join(
  REPO_DIRECTORY,
  ".github/calibre/image-actions.yml"
);

const EXTENSION_TO_SHARP_FORMAT_MAPPING = {
  ".png": "png",
  ".jpeg": "jpeg",
  ".jpg": "jpeg",
  ".webp": "webp"
};

module.exports = {
  GITHUB_TOKEN,
  GITHUB_EVENT_NAME,
  GITHUB_EVENT_PATH,
  GITHUB_SHA,
  GITHUB_REF,
  GITHUB_REPOSITORY,
  REPO_DIRECTORY,
  CONFIG_PATH,
  EXTENSION_TO_SHARP_FORMAT_MAPPING,
  COMMITTER,
  JPEG_QUALITY,
  PNG_QUALITY,
  WEBP_QUALITY,
  IGNORE_PATHS
};
