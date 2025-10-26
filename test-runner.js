import { runAnalysisAccuracyTests } from './src/tests/analysisAccuracyTest';
runAnalysisAccuracyTests().then(results => {
  console.log("Test Results:", JSON.stringify(results, null, 2));
});
