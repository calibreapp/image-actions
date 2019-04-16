const api = require("./github-api");
const githubEvent = require("./github-event");

const createComment = async body => {
  const event = await githubEvent();
  const owner = event.repository.owner.login;
  const repo = event.repository.name;
  const number = event.number;

  return api.issues.createComment({ owner, repo, number, body });
};

module.exports = createComment;
