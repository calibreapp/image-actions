const fs = require("fs").promises;

const { GITHUB_EVENT_PATH } = require("./constants");

const event = async () => JSON.parse(await fs.readFile(GITHUB_EVENT_PATH));

module.exports = event;
