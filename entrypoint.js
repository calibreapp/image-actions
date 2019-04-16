#!/usr/bin/env node

const {
  REPO_DIRECTORY,
  GITHUB_TOKEN,
  GITHUB_EVENT_NAME,
  COMMITTER
} = require("./src/constants");

const githubEvent = require("./src/github-event");
const generateMarkdownReport = require("./src/github-markdown");
const processImages = require("./src/image-processing");
const createComment = require("./src/github-pr-comment");

if (!GITHUB_TOKEN) {
  console.log("You must enable the GITHUB_TOKEN secret");
  process.exit(1);
}

if (!REPO_DIRECTORY) {
  console.log("There is no REPO_DIRECTORY set");
  process.exit(1);
}

const main = async () => {
  // Bail out if the event that executed the action wasn’t a pull_request
  if (GITHUB_EVENT_NAME !== "pull_request") {
    console.log("This action only runs for pushes to PRs");
    process.exit(78);
  }

  // Bail out if the pull_request event wasn't synchronize or opened
  const event = await githubEvent();
  if (event.action !== "synchronize" && event.action !== "opened") {
    console.log(
      "Check run has action",
      event.action,
      ". Want: synchronize or opened"
    );
    process.exit(78);
  }

  console.log("->> Locating images…");
  const results = await processImages();

  console.log(JSON.stringify(results, null, 2));

  const imagesWereOptimised = results.some(
    result => result.compressionWasSignificant
  );

  // If nothing was optimised, bail out.
  if (!imagesWereOptimised) {
    console.log("Nothing left to optimise. Stopping…");
    return;
  }

  console.log("->> Generating markdown…");
  const markdown = await generateMarkdownReport(results);

  console.log("->> Leaving comment on PR…");
  await createComment(markdown);
};

main();
