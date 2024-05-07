#!/bin/bash
export NODE_ENV=build

set -a
source .env.build.local
set +a

eas build --local
