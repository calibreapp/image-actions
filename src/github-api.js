const { GITHUB_TOKEN } = require("./constants");

const Octokit = require("@octokit/rest");
const octokit = new Octokit({ auth: `token ${GITHUB_TOKEN}` });

module.exports = octokit;
