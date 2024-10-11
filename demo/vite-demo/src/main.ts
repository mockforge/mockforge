import axios from 'axios';
import './main.css';

interface TestCase {
  title: string;
  testCase: () => Promise<void>;
}

interface RequestOptions {
  method: 'GET' | 'POST';
  url: string;
}

interface ExpectedData {
  [key: string]: any;
}

const testCases: TestCase[] = [];

function runTest(title: string, testCase: () => Promise<void>) {
  testCases.push({ title, testCase });
}

async function executeTests() {
  const results: { title: string; passed: boolean; error?: string }[] = [];

  for (const test of testCases) {
    try {
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 1000);
      });

      await Promise.race([test.testCase(), timeoutPromise]);
      results.push({ title: test.title, passed: true });
    } catch (error) {
      results.push({ title: test.title, passed: false, error: (error as Error).message });
    }
  }

  displayResults(results);
}

function displayResults(results: { title: string; passed: boolean; error?: string }[]) {
  document.body.innerHTML = `
    <h1>Test Results</h1>
    <div class="results-container">
      <table>
        <thead>
          <tr>
            <th>Test Case</th>
            <th>Result</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          ${results
            .map(
              (result) => `
            <tr>
              <td>${result.title}</td>
              <td>
                <span class="status-icon ${result.passed ? 'passed' : 'failed'}"></span>
                <span class="${result.passed ? 'passed' : 'failed'}">
                  ${result.passed ? 'Passed' : 'Failed'}
                </span>
              </td>
              <td class="error">${result.error || ''}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  // 在一个不可见的元素里塞 results
  const resultsEl = document.createElement('div');
  resultsEl.id = 'results';
  resultsEl.style.display = 'none';
  resultsEl.textContent = JSON.stringify(results);
  document.body.appendChild(resultsEl);
}

async function makeRequest({ method, url }: RequestOptions, expectedData: ExpectedData): Promise<void> {
  const fetchRes = await fetch(url, { method });
  const fetchData = await fetchRes.json();

  const axiosRes = await axios({ method, url });
  const axiosData = axiosRes.data;

  // Compare fetch and axios results
  if (JSON.stringify(fetchData) !== JSON.stringify(axiosData)) {
    throw new Error(`Fetch and Axios results do not match for ${method} ${url}`);
  }

  // Compare results with expected data
  for (const [key, value] of Object.entries(expectedData)) {
    if (fetchData[key] !== value) {
      throw new Error(`Expected ${key} to be ${value}, but got ${fetchData[key]} for ${method} ${url}`);
    }
  }
}

runTest('GET /one', async () => {
  return makeRequest({ method: 'GET', url: '/one' }, { name: 'one' });
});

runTest('POST /two', async () => {
  return await makeRequest({ method: 'POST', url: '/two' }, { data: 'two' });
});

runTest('GET /data.json', async () => {
  return await makeRequest({ method: 'GET', url: '/data.json' }, { value: 'real-data' });
});

await executeTests();
