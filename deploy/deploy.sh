#!/bin/bash

set -ex

cd benchmarks-image-service

# Global config file is required
# See: https://github.com/cloudflare/wrangler/pull/225
wrangler config dummy_value dummy_value

wrangler publish --release

cd ../probot-app-report-benchmarks

APP_URL=$(now --npm --public -e PRIVATE_KEY=@fusion-benchmarks-private-key -e APP_ID=$APP_ID -e WEBHOOK_SECRET=@fusion-benchmarks-webhook-secret -e NODE_ENV="production" -e LOG_LEVEL=debug -T $NOW_TEAM -t $NOW_TOKEN)
now scale $APP_URL sfo 1 -T $NOW_TEAM --token=$NOW_TOKEN
now alias set $APP_URL $NOW_ALIAS -T $NOW_TEAM -t $NOW_TOKEN
now rm $NOW_PROJECT --safe -y -T $NOW_TEAM -t $NOW_TOKEN || true
