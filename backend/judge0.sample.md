# Official endpoints of Judge0 API

1. Create a submission

```
const axios = require('axios');

const options = {
  method: 'POST',
  url: 'https://judge0-ce.p.rapidapi.com/submissions',
  params: {
    base64_encoded: 'true',
    wait: 'false',
    fields: '*'
  },
  headers: {
    'x-rapidapi-key': '',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
    language_id: 52,
    source_code: 'I2luY2x1ZGUgPHN0ZGlvLmg+CgppbnQgbWFpbih2b2lkKSB7CiAgY2hhciBuYW1lWzEwXTsKICBzY2FuZigiJXMiLCBuYW1lKTsKICBwcmludGYoImhlbGxvLCAlc1xuIiwgbmFtZSk7CiAgcmV0dXJuIDA7Cn0=',
    stdin: 'SnVkZ2Uw'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

fetchData();
```

2. get a submission

```
const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/2e979232-92fd-4012-97cf-3e9177257d10',
  params: {
    base64_encoded: 'true',
    fields: '*'
  },
  headers: {
    'x-rapidapi-key': '',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

fetchData();
```

3. Create a Batched Submission

```
const axios = require('axios');

const options = {
  method: 'POST',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    base64_encoded: 'true'
  },
  headers: {
    'x-rapidapi-key': '',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
    submissions: [
      {
        language_id: 46,
        source_code: 'ZWNobyBoZWxsbyBmcm9tIEJhc2gK'
      },
      {
        language_id: 71,
        source_code: 'cHJpbnQoImhlbGxvIGZyb20gUHl0aG9uIikK'
      },
      {
        language_id: 72,
        source_code: 'cHV0cygiaGVsbG8gZnJvbSBSdWJ5IikK'
      }
    ]
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

fetchData();
```

4. Get a Batched Submission

```
const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    tokens: 'dce7bbc5-a8c9-4159-a28f-ac264e48c371,1ed737ca-ee34-454d-a06f-bbc73836473e,9670af73-519f-4136-869c-340086d406db',
    base64_encoded: 'true',
    fields: '*'
  },
  headers: {
    'x-rapidapi-key': '',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

fetchData();
```

5. Get a Language

```
const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/languages/52',
  headers: {
    'x-rapidapi-key': '',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

fetchData();
```

6. Get Languages

```
const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/languages',
  headers: {
    'x-rapidapi-key': '',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

fetchData();
```

7. Get Statuses

```
const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/statuses',
  headers: {
    'x-rapidapi-key': '',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

fetchData();
```

8. Get config

```
const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/config_info',
  headers: {
    'x-rapidapi-key': '',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

fetchData();
```

9. About

```
const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/config_info',
  headers: {
    'x-rapidapi-key': '',
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

fetchData();
```
