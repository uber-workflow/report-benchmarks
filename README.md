# report-benchmarks

> a GitHub App built with [probot](https://github.com/probot/probot) that comments on pull requests a series of boxplots showing the difference in compile time between the BASE and HEAD commits (using data stored in a checkrun)
The app itself is stored in the ./benchmark-reporter directory.
## Overview

The app relies on a microservice (stored in ./scheming) to generate the boxplots from the data.

The microservice generates svg images from data in a GET request, allowing the URL to be directly embedded into the html on your page, or, in this case, in a comment on GitHub.

Then, whenever a pr is opened, or the 'Benchmarks' check finishes running, the GitHub app queries the microservice, and posts the result as a comment.

## Setup
The microservice is hosted using [Cloudflare Workers](https://workers.cloudflare.com/)
