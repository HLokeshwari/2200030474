const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 9876;
const windowSize = 10;

let windowState = [];
let authToken = null;

const apiEndpoints = {
  p: 'http://20.244.56.144/evaluation-service/primes',
  f: 'http://20.244.56.144/evaluation-service/fibo',
  e: 'http://20.244.56.144/evaluation-service/even',
  r: 'http://20.244.56.144/evaluation-service/rand'
};

app.use(cors());
app.use(express.json());

const fetchAuthToken = async () => {
  try {
    console.log('Attempting to fetch auth token...');
    const response = await axios.post('http://20.244.56.144/evaluation-service/auth', {
      email: "2200030474cseh@gmail.com",
      name: "Lokeshwari Hukumathirao",
      mobileNo: "7416859518",
      githubUsername: "HLokeshwari",
      rollNo: "2200030474",
      collegeName: "KL University",
      accessCode: "beTJjJ",
      clientID: "396a1d49-14e7-4149-975b-f4398a239203",
      clientSecret: "cRmUXPPbkGHzyHGA"
    });
    authToken = response.data.access_token;
    console.log('Auth token fetched successfully:', authToken);
    console.log('Token expires in:', response.data.expires_in);
    return true;
  } catch (error) {
    console.error('Error fetching auth token:', error.message);
    if (error.response) {
      console.error('Auth response status:', error.response.status);
      console.error('Auth response data:', error.response.data);
    }
    authToken = null;
    return false;
  }
};

// Fetch token on server start
fetchAuthToken();

const fetchNumbers = async (type) => {
  if (!authToken) {
    console.log('No auth token available, attempting to fetch...');
    const success = await fetchAuthToken();
    if (!success) {
      console.error('Failed to fetch auth token, cannot proceed with request');
      return [];
    }
  }

  try {
    console.log(`Fetching ${type} numbers with token:`, authToken);
    console.log('Request headers:', { Authorization: `Bearer ${authToken}` });
    const response = await axios.get(apiEndpoints[type], {
      timeout: 500,
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    console.log(`Response from ${type} numbers API:`, response.data);
    return response.data.numbers || [];
  } catch (error) {
    console.error(`Error fetching ${type} numbers:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
      if (error.response.status === 401) {
        console.log('Received 401 Unauthorized, retrying with new token...');
        authToken = null; // Invalidate current token
        const success = await fetchAuthToken();
        if (success) {
          try {
            console.log('Retrying request with new token:', authToken);
            const retryResponse = await axios.get(apiEndpoints[type], {
              timeout: 500,
              headers: {
                Authorization: `Bearer ${authToken}`
              }
            });
            console.log(`Retry response from ${type} numbers API:`, retryResponse.data);
            return retryResponse.data.numbers || [];
          } catch (retryError) {
            console.error('Retry failed:', retryError.message);
            if (retryError.response) {
              console.error('Retry response status:', retryError.response.status);
              console.error('Retry response data:', retryError.response.data);
            }
          }
        }
      }
    }
    return [];
  }
};

const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return Number((sum / numbers.length).toFixed(2));
};

app.get('/numbers/:numberId', async (req, res) => {
  const { numberId } = req.params;

  if (!['p', 'f', 'e', 'r'].includes(numberId)) {
    return res.status(400).json({ error: 'Invalid numberId. Must be p, f, e, or r.' });
  }

  const windowPrevState = [...windowState];
  const newNumbers = await fetchNumbers(numberId);
  const uniqueNumbers = [...new Set([...windowState, ...newNumbers])];
  windowState = uniqueNumbers.slice(-windowSize);
  const avg = calculateAverage(windowState);

  res.json({
    windowPrevState,
    windowCurrState: windowState,
    numbers: newNumbers,
    avg
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});