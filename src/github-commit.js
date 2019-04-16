// https://github.com/octokit/rest.js/issues/509#issuecomment-370764629
// https://runkit.com/gr2m/create-a-pull-request-using-git-apis/1.0.0

// commit back to repo
/*
  const owner = 'calibreapp'
  const repo = 'app'
  const message = 'Compressed images with image-actions'
  const tree = undefined // The SHA of the tree object this commit points to
  const parents
  const committer = COMMITTER
  const author = committer 
  
  const commit = await octokit.git.createCommit({owner, repo, message, tree, parents, committer, author})
  // post on pull request as a comment
  //https://octokit.github.io/rest.js/#api-Issues-createComment

  await octokit.issues.createComment({owner, repo, number, body})

  */
