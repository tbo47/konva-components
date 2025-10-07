rm -rf dist
VERSION=$(jq -r '.version' package.json)
OUTFILE=dist/konva-components-$VERSION.js
npx esbuild src/index.ts --bundle --platform=neutral --packages=external --outfile=$OUTFILE