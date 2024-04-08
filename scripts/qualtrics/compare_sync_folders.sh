#!/bin/bash

# Directories to compare
FOLDER_A="/Users/mtbutler/Desktop/Campaign Qualtrics/ads"
FOLDER_B="/Users/mtbutler/Downloads/pres_trimmed_incl_scene"
LOG_FILE="/Users/mtbutler/Desktop/logfile.txt"

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

# Loop through files in Folder B
find "$FOLDER_B" -type f | while read fileB; do
  # Extract filename from path
  filename=$(basename "$fileB")
  
  # Check if this file does not exist in Folder A
  if [[ ! -f "$FOLDER_A/$filename" ]]; then
    echo "Deleting $fileB as it does not exist in Folder A."
    echo "$filename" >> "$LOG_FILE"
    rm "$fileB"
  fi
done

echo "Folder B synchronization complete. Check $LOG_FILE for details."
