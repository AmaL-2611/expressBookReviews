# Express Book Review — Full Project

This project implements a simple Express server for a book review API and includes a client `general.js` (Axios) plus a Node script to generate the required cURL-style output files for the Coursera-style assignment.

Quick steps:

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
# Server listens on http://localhost:3000
```

3. Generate the requested cURL outputs (creates `scripts/outputs/*`):

```bash
npm run generate-outputs
```

Files created by the generator:

- `scripts/outputs/githubrepo` — placeholder for the GitHub repo curl (run locally against GitHub API to confirm fork)
- `scripts/outputs/getallbooks`
- `scripts/outputs/getbooksbyISBN`
- `scripts/outputs/getbooksbyauthor`
- `scripts/outputs/getbooksbytitle`
- `scripts/outputs/getbookreview`
- `scripts/outputs/register`
- `scripts/outputs/login`
- `scripts/outputs/reviewadded`
- `scripts/outputs/deletereview`

The repository includes `general.js` which demonstrates how to fetch books with Axios. Example usage:

```bash
node general.js all
node general.js isbn 1
node general.js author "Kyle Simpson"
node general.js title "Eloquent"
```

To publish `general.js` to GitHub, create a new repo, commit files, and push. Then your public URL will be:

https://github.com/<your-username>/<your-repo>/blob/main/general.js
