#!/bin/bash
# This is a very basic build script to make it easier to transition to a user script.
# Will advance to a more sophisticated one once the basic userscript loading is done.

echo "Cleaning old build..."
find bin ! -name '*SecretKey.js' -type f -exec rm -rf {} +

echo "Copying images..."
cp -r src/img/ bin/

echo "Concatting Stylesheets..."
find src/css -type f -name "*.css" -exec cat {} >> bin/ConnectionGeography.css \;

echo "Concatting JavaScript..."
find src/js/ -type f -name "*.js" ! -name "main.js" ! -name "bootstrap.js" -exec cat {} >> bin/ConnectionGeography.js \;

echo "Adding main..."
cat src/js/main.js >> bin/ConnectionGeography.js

echo "Adding bootstap..."
cat src/js/bootstrap.js > bin/bootstrap.js

echo "Adding entry points..."
cat src/index.html > bin/index.tpl
cat src/navigation.html > bin/navigation.tpl

echo Done.
