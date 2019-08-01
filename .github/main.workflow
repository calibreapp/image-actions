workflow "Test" {
  on = "push"
  resolves = ["npm test"]
}

action "npm ci" {
  uses = "./"
  runs = "npm"
  args = "ci"
}

action "npm test" {
  needs = "npm ci"
  uses = "./"
  runs = "npm"
  args = "test"
}
