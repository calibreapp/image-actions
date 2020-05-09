const generateMarkdownReport = require("./github-markdown");
const processImages = require("./image-processing");
const createComment = require("./github-pr-comment");
const createCommit = require("./github-commit");
const getConfig = require("./config");

const run = async () => {
  const config = await getConfig();

  console.log("->> Locating images…");

  const results = await processImages(config);

  const optimisedImages = results.images.filter(
    img => img.compressionWasSignificant
  );

  // If nothing was optimised, bail out.
  if (!optimisedImages.length) {
    console.log("::warning:: Nothing left to optimise. Stopping…");
    return;
  }

  console.log("->> Generating markdown…");
  const markdown = await generateMarkdownReport(results);

  // Expose the markdown to an Action output
  const escaped_markdown = markdown.replace(/\%/g,'%25').replace(/\n/g,'%0A').replace(/\r/g,'%0D')
  console.log("::set-output name=markdown::" + escaped_markdown)

  // If compress only mode, then we're done
  if (config.compressOnly) {
    console.log("->> compressOnly was set. Stopping.");
    return results;
  }

  console.log("->> Committing files…");
  await createCommit(optimisedImages);

  console.log("->> Leaving comment on PR…");
  await createComment(markdown);

  return results;
};

module.exports = run;
