#!/bin/bash

function error_exit
{
  echo -e "\e[01;31m$1\e[00m" 1>&2
  exit 1
}

./node_modules/.bin/grunt build || error_exit "Error building spec"

if [ "$TRAVIS_PULL_REQUEST" == "false" ] && [ "$TRAVIS_BRANCH" == "master" ]; then
  ./node_modules/.bin/grunt publish || error_exit "Error publishing spec"

  git config --global user.name "$COMMIT_USER (via Travis CI)"
  git config --global user.email "$COMMIT_EMAIL"

  export COMMIT_MESSAGE=$(echo -e "$TRAVIS_COMMIT_MSG\n\nGenerated from:\n";
                          git log $TRAVIS_COMMIT_RANGE)

  ./node_modules/.bin/grunt upload || "Error uploading to gh-pages branch"
fi
