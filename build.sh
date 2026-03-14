#!/usr/bin/env bash
set -euo pipefail

# Always run relative to the repo root so it works on Render and locally
ROOT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Building frontend..."
pushd "${ROOT_DIR}/frontend" >/dev/null
npm install
npm run build
popd >/dev/null

echo "Copying frontend build to backend/staticfiles..."
mkdir -p "${ROOT_DIR}/backend/staticfiles"
cp -r "${ROOT_DIR}/frontend/dist/"* "${ROOT_DIR}/backend/staticfiles/"

echo "Installing backend dependencies..."
pushd "${ROOT_DIR}/backend" >/dev/null
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Running migrations..."
python manage.py migrate --noinput
popd >/dev/null

echo "Build complete!"
