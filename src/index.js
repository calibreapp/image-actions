const generateMarkdownReport = require("./github-markdown");
const processImages = require("./image-processing");
const createComment = require("./github-pr-comment");
const createCommit = require("./github-commit");

const run = async () => {
  console.log("->> Locating images…");

  const {images, metrics} = await processImages();

  const optimisedImages = images.filter(
    (img) => img.compressionWasSignificant
  );

  // If nothing was optimised, bail out.
  if (!optimisedImages.length) {
    console.log("::warning:: Nothing left to optimise. Stopping…");
    return;
  }

  console.log("->> Committing files…");
  const { sha } = await createCommit(optimisedImages);

  console.log("->> Generating markdown…");
  const markdown = await generateMarkdownReport({
    images,
    metrics, 
    commitSha: sha
  });

  console.log("->> Leaving comment on PR…");
  await createComment(markdown);

  return results;
};

module.exports = run;
