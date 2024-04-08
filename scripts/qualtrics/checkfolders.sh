#!/bin/bash

# Directories to compare
FOLDER_A="/Users/mtbutler/Desktop/Campaign Qualtrics/ads"
FOLDER_B="/Users/mtbutler/Downloads/pres_trimmed_incl_scene"
LOG_FILE="/Users/mtbutler/Desktop/log.txt"

# Ensure both directories exist
if [[ ! -d "$FOLDER_A" ]]; then
  echo "Folder A does not exist."
  exit 1
fi

if [[ ! -d "$FOLDER_B" ]]; then
  echo "Folder B does not exist."
  exit 1
fi

# Ensure the log file exists, or create it
touch "$LOG_FILE"

# Empty the log file to start fresh
> "$LOG_FILE"

# Loop through files in Folder A
find "$FOLDER_A" -type f | while read fileA; do
  # Extract filename from path
  filename=$(basename "$fileA")
  
  # Check if this file does not exist in Folder B
  if [[ ! -f "$FOLDER_B/$filename" ]]; then
    echo "Missing in Folder B: $filename" >> "$LOG_FILE"
  fi
done

echo "Comparison complete. Check $LOG_FILE for files missing in Folder B."
