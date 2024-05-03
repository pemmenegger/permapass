#!/bin/bash
# Load local environment variables
set -a
source .env
set +a

eas build --local
