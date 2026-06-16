const axios = require('axios');

const key = 'f2202f5a62mshabbd4eba52492ebp1e4a82jsn5103a1c3c2bb';
const host = 'free-cricbuzz-cricket-api.p.rapidapi.com';

const paths = [
  '/cricket-livescores',
  '/cricket-schedule'
];

async function run() {
  for (const path of paths) {
    const url = `https://${host}${path}`;
    console.log(`Querying ${url}...`);
    try {
      const response = await axios.get(url, {
        headers: {
          'X-RapidAPI-Key': key,
          'X-RapidAPI-Host': host
        },
        timeout: 8000
      });
      console.log(`[SUCCESS] Status ${response.status}`);
      console.log(JSON.stringify(response.data).substring(0, 1500));
      console.log('====================================');
    } catch (error) {
      const status = error.response ? error.response.status : 'NO_RESPONSE';
      const msg = error.response ? JSON.stringify(error.response.data) : error.message;
      console.log(`[FAIL] Status ${status} - ${msg}`);
    }
  }
}

run();
