import { PythonDataFlowAnalyzer } from "./src/services/analysis/PythonDataFlowAnalyzer";

async function runTest() {
  console.log("\n==============================");
  console.log(" PYTHON DATA FLOW TEST START ");
  console.log("==============================\n");

  const analyzer = new PythonDataFlowAnalyzer();

  console.log("Initializing parser...");
  await analyzer.init();
  console.log("Parser initialized successfully\n");

  const files = [
    {
      filename: "test.py",
      content: `
x = input()
y = x
z = y

def run(cmd):
    import os
    os.system(cmd)

run(z)

# propagation through return value

def echo(val):
    return val

foo = echo(x)
os.system(foo)  # should be flagged

# sanitized data should not be flagged
safe = sanitize(x)
os.system(safe)

# source variants
import sys
arg = sys.argv[1]
os.system(arg)  # flagged

`,
    },
  ];
  const issues = analyzer.analyzeDataFlow(files);

  console.log("==================================");
  console.log(" ANALYSIS RESULT");
  console.log("==================================\n");

  console.log("Issues found:", issues.length);

  if (issues.length === 0) {
    console.log("No vulnerabilities detected");
  } else {
    console.log(JSON.stringify(issues, null, 2));
  }

  console.log("\n==============================");
  console.log(" TEST FINISHED");
  console.log("==============================\n");
}

runTest();
