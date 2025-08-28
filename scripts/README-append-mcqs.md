Append new MCQs to the CSV

This small script appends MCQs from a JSON file into `public/data/ceemcq.csv`.

Usage:

1. Create a JSON array of MCQ objects. Example file: `scripts/new-mcqs.json`.
2. Run:

   node scripts/append-mcqs.js scripts/new-mcqs.json

Notes:
- The script appends rows to the CSV. Make a backup of `public/data/ceemcq.csv` before running.
- The JSON object keys should match the CSV headers (case-insensitive). If `id` is missing, a generated id will be used.
- This is intentionally a local file utility — it does not call any external API.
