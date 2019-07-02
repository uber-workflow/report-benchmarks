workflow "Push handler" {
  resolves = ["Deploy"]
  on = "push"
}

action "Master" {
  uses = "actions/bin/filter@master"
  args = "branch master"
}

action "Deploy" {
  uses = "./deploy"
  needs = ["Master"]
}
