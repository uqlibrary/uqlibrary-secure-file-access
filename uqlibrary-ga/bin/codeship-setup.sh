#!/bin/bash

set -e

printf "Node "; node -v;
printf "(Before npm i -g) npm v"; npm -v

npm install -g bower web-component-tester polymer-cli npm@6

npm install
bower install