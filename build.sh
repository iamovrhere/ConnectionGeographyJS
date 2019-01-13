#!/bin/bash
# This is a very basic build script to make it easier to transition to a user script.
# Will advance to a more sophisticated one once the basic userscript loading is done.

echo "Cleaning old build..."
rm -rf bin/*

echo "Copying images..."
cp -r src/img/ bin/

echo "Concatting Stylesheets..."
find src/css -type f -name "*.css" -exec cat {} >> bin/ConnectionGeography.css \;

echo "Concatting JavaScript..."
find src/js/ -type f -name "*.js" ! -name "main.js" -exec cat {} >> bin/ConnectionGeography.js \;

echo "Adding final main."
cat src/js/main.js >> bin/ConnectionGeography.js

echo Done.
