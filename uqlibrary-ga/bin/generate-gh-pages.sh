#!/bin/bash -e

# Creates and updates the "gh-pages" branch of the current repository
#
# Usage: ./generate-gh-pages.sh <branch>
# Example: ./generate-gh-pages.sh master

# Get repo from DIR name
cd `dirname "${BASH_SOURCE[0]}"`;
REPO="$(basename `git rev-parse --show-toplevel`)";

ORG="uqlibrary";

# Get branch
BRANCH=${1:-"polymer1.0"}

# Make temporary dir and GIT clone
rm -rf "../tmp/$REPO";
mkdir -p "../tmp/$REPO";
cd "../tmp";
git clone -b $BRANCH git@github.com:$ORG/$REPO.git --single-branch

# Switch to gh-pages branch
cd $REPO >/dev/null
git checkout --orphan gh-pages

# Remove all non-relevant content
git rm -rf .gitignore
git rm -rf bin
git rm -rf test

# Bower install
bower cache clean $REPO # ensure we're getting the latest from the desired branch.
bower install --production

# Move one level up to include bower dependencies
mv .git ../
mv README.md ../index.md
cd ../

# Send it all to github
git add -A .
git commit -am 'seed gh-pages'
git push -u origin gh-pages --force

cd "..";
echo `pwd`;
rm -rf tmp;