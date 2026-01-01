import { runAnalysisAccuracyTests } from "../src/tests/analysisAccuracyTest";

async function main() {
  console.log("Running Analysis Accuracy Tests...");
  try {
    const results = await runAnalysisAccuracyTests();
    if (results.failed > 0) {
      console.error("Tests failed!");
      process.exit(1);
    } else {
      console.log("All tests passed!");
      process.exit(0);
    }
  } catch (error) {
    console.error("Error running tests:", error);
    process.exit(1);
  }
}

main();
