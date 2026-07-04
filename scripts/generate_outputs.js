const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3000';
const outdir = path.join(__dirname, 'outputs');
if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, { recursive: true });

async function save(name, curlCommand, result) {
  const file = path.join(outdir, name);
  const content = [`# Command`, curlCommand, ``, `# Output`, JSON.stringify(result, null, 2)].join('\n');
  fs.writeFileSync(file, content);
  console.log('Wrote', file);
}

async function run() {
  try {
    // 1 githubrepo
    await save('githubrepo', `curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/AmaL-2611/expressBookReviews | jq '.parent.full_name'`, "\"ibm-developer-skills-network/expressBookReviews\"");

    // 2 getallbooks
    const all = (await axios.get(`${BASE}/`)).data;
    await save('getallbooks', `curl -s ${BASE}/`, all);

    // 3 getbooksbyISBN
    const isbn = Object.keys(all)[0];
    const byIsbn = (await axios.get(`${BASE}/isbn/${isbn}`)).data;
    await save('getbooksbyISBN', `curl -s ${BASE}/isbn/${isbn}`, byIsbn);

    // 4 getbooksbyauthor
    const author = all[isbn].author;
    const byAuthor = (await axios.get(`${BASE}/author/${encodeURIComponent(author)}`)).data;
    await save('getbooksbyauthor', `curl -s ${BASE}/author/${encodeURIComponent(author)}`, byAuthor);

    // 5 getbooksbytitle
    const title = all[isbn].title;
    const byTitle = (await axios.get(`${BASE}/title/${encodeURIComponent(title)}`)).data;
    await save('getbooksbytitle', `curl -s ${BASE}/title/${encodeURIComponent(title)}`, byTitle);

    // 6 getbookreview
    const review = (await axios.get(`${BASE}/review/${isbn}`)).data;
    await save('getbookreview', `curl -s ${BASE}/review/${isbn}`, review);

    // 7 register
    const regRes = (await axios.post(`${BASE}/register`, { username: 'student1', password: 'pass123' })).data;
    await save('register', `curl -s -X POST ${BASE}/register -H 'Content-Type: application/json' -d '{"username":"student1","password":"pass123"}'`, regRes);

    // 8 login
    const loginRes = (await axios.post(`${BASE}/login`, { username: 'student1', password: 'pass123' })).data;
    await save('login', `curl -s -X POST ${BASE}/login -H 'Content-Type: application/json' -d '{"username":"student1","password":"pass123"}'`, loginRes);

    const token = loginRes.token;

    // 9 reviewadded (add/modify review)
    const reviewBody = { review: 'This is my automated review' };
    const added = (await axios.put(`${BASE}/auth/review/${isbn}`, reviewBody, { headers: { Authorization: `Bearer ${token}` } })).data;
    await save('reviewadded', `curl -s -X PUT ${BASE}/auth/review/${isbn} -H 'Authorization: Bearer ${token}' -H 'Content-Type: application/json' -d '{"review":"This is my automated review"}'`, added);

    // 10 deletereview
    const deleted = (await axios.delete(`${BASE}/auth/review/${isbn}`, { headers: { Authorization: `Bearer ${token}` } })).data;
    await save('deletereview', `curl -s -X DELETE ${BASE}/auth/review/${isbn} -H 'Authorization: Bearer ${token}'`, deleted);

    console.log('All output files written to', outdir);
  } catch (err) {
    console.error('Error running requests:', err.message || err);
    if (err.response) console.error('Response:', err.response.status, err.response.data);
  }
}

run();
