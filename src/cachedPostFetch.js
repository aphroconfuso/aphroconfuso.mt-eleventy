const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const crypto = require('crypto');

const cacheDir = path.resolve('.cache');
if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

module.exports = async function cachedPostFetch(url, bodyObj, cacheSuffix = '.json') {
  // const bodyString = JSON.stringify(bodyObj);
  const bodyString = bodyObj.body;

	const cachedQuery = process.env.CACHED_QUERY === 'True' || false;

  // Always bypass cache unless running on localhost
  if (!cachedQuery) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: bodyString,
    });
    return res.json();
	} else {
		console.log(`Using cached query for ${url} !!!`);
	}

  const hash = crypto
    .createHash('md5')
    .update(url + bodyString)
    .digest('hex');

  const filePath = path.join(cacheDir, hash + cacheSuffix);

  if (fs.existsSync(filePath)) {
    const cached = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(cached);
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: bodyString,
  });

  const data = await res.text();
  fs.writeFileSync(filePath, data, 'utf-8');
  return JSON.parse(data);
};
