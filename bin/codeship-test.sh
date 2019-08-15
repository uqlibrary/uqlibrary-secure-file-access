#!/bin/bash

set -e

printf "Node "; node -v;
printf "npm v"; npm -v

npm test