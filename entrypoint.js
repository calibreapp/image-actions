#!/usr/bin/env node

const { GITHUB_TOKEN, GITHUB_EVENT_NAME } = require("./src/constants");

const githubEvent = require("./src/github-event");
const run = require("./src/index.js");

if (!GITHUB_TOKEN && GITHUB_EVENT_NAME == "pull_request" ) {
  console.log("You must enable the GITHUB_TOKEN secret");
  process.exit(1);
}

const main = async () => {
  // Bail out if the event that executed the action wasn’t a pull_request or a push
  if (GITHUB_EVENT_NAME !== "pull_request" || GITHUB_EVENT_NAME != "push") {
    console.log("::error::This action only runs for pushes or PRs");
    process.exit(78);
  }

  // Bail out if the pull_request event wasn't synchronize or opened
  const event = await githubEvent();
  if (GITHUB_EVENT_NAME == "pull_request" && event.action !== "synchronize" && event.action !== "opened") {
    console.log(
      "::error::Check run has action",
      event.action,
      ". Want: synchronize or opened"
    );
    process.exit(78);
  }

  await run();
};

main();
