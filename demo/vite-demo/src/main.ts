import axios from 'axios';
import './main.css';

interface TestCase {
  title: string;
  testCase: () => Promise<boolean>;
}

const testCases: TestCase[] = [];

function runTest(title: string, testCase: () => Promise<boolean>) {
  testCases.push({ title, testCase });
}

async function executeTests() {
  const results: { title: string; passed: boolean; error?: string }[] = [];

  for (const test of testCases) {
    try {
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 1000);
      });

      const testPromise = test.testCase();
      const passed = await Promise.race([testPromise, timeoutPromise]);

      results.push({ title: test.title, passed });
    } catch (error) {
      results.push({ title: test.title, passed: false, error: (error as Error).message });
    }
  }

  displayResults(results);
}

function displayResults(results: { title: string; passed: boolean; error?: string }[]) {
  document.body.innerHTML = `
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
                <td class="${result.passed ? 'passed' : 'failed'}">
                  ${result.passed ? 'Passed' : 'Failed'}
                </td>
                <td class="error">${result.error || ''}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
  `;
}

runTest('axios.get /one', async () => {
  const res = await axios.get('/one');
  return res.data.name === 'one';
});

runTest('fetch.get /one', async () => {
  const res = await fetch('/one');
  const json = await res.json();
  return json.name === 'one';
});

await executeTests();
