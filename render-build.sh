#!/usr/bin/env bash
pip install -r requirements.txt
cd frontend
npm install
chmod +x node_modules/.bin/vite
npm run build
cd ..