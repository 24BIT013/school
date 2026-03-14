#!/bin/bash

# Build the frontend
echo "Building frontend..."
cd frontend
npm install
npm run build

# Copy built files to backend static directory
echo "Copying frontend build to backend..."
mkdir -p ../backend/staticfiles
cp -r dist/* ../backend/staticfiles/

echo "Build complete!"</content>
<parameter name="filePath">c:/Users/Administrator/OneDrive/Desktop/systemschool/build.sh