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
  secrets = [
    "APP_ID",
    "CF_API_KEY",
    "CF_EMAIL",
    "CF_ACCOUNT_ID",
    "NOW_TOKEN",
  ]
  env = {
    NOW_ALIAS = "fusion-benchmarks.now.sh"
    NOW_TEAM = "fusionjs"
    NOW_PROJECT = "fusion-benchmarks"
    CHART_URL = "https://benchmarks.fusionjs.workers.dev"
  }
}
