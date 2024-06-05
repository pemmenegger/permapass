#!/bin/bash
export APP_ENV=build

set -a
source .env.build.local
set +a

eas build --local
