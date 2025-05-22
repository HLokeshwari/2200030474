import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [numberType, setNumberType] = useState('p');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchNumbers = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await axios.get(`http://localhost:9876/numbers/${numberType}`);
      setResponse(res.data);
    } catch (err) {
      setError('Error fetching numbers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Average Calculator Microservice</h1>
      <div>
        <label>Select Number Type: </label>
        <select value={numberType} onChange={(e) => setNumberType(e.target.value)}>
          <option value="p">Prime</option>
          <option value="f">Fibonacci</option>
          <option value="e">Even</option>
          <option value="r">Random</option>
        </select>
        <button onClick={fetchNumbers} disabled={loading}>
          {loading ? 'Fetching...' : 'Fetch Numbers'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {response && (
        <div>
          <h2>Response</h2>
          <p><strong>Previous Window State:</strong> [{response.windowPrevState.join(', ')}]</p>
          <p><strong>Current Window State:</strong> [{response.windowCurrState.join(', ')}]</p>
          <p><strong>Numbers Fetched:</strong> [{response.numbers.join(', ')}]</p>
          <p><strong>Average:</strong> {response.avg}</p>
        </div>
      )}
    </div>
  );
}

export default App;