#!/bin/bash
cd /home/kavia/workspace/code-generation/resident-management-system-195504-195514/residency_app_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

