// Test file demonstrating advanced vulnerability detection

// 1. AST Detection - Code Injection
function processUserCode(userInput) {
  // CRITICAL: Code injection via eval
  return eval(userInput);
}

// 2. AST Detection - Command Injection
const { exec } = require('child_process');
function runCommand(cmd) {
  // CRITICAL: Command injection
  exec(cmd);
}

// 3. Data Flow Analysis - SQL Injection
function getUserData(req, res) {
  const userId = req.query.id; // Taint source
  const query = `SELECT * FROM users WHERE id = ${userId}`; // SQL Injection
  db.query(query); // Taint sink
}

// 4. Data Flow Analysis - XSS
function displayMessage(req, res) {
  const message = req.body.message; // Taint source
  const html = `<div>${message}</div>`; // XSS vulnerability
  res.send(html); // Taint sink
}

// 5. AST Detection - React XSS
function UserProfile({ userData }) {
  // HIGH: Dangerous React pattern
  return (
    <div dangerouslySetInnerHTML={{ __html: userData.bio }} />
  );
}

// 6. AST Detection - DOM XSS
function updateContent(userContent) {
  // HIGH: DOM-based XSS
  document.getElementById('content').innerHTML = userContent;
}

// 7. AST Detection - Hardcoded Secret
const API_KEY = 'placeholder_stripe_api_key';
const AWS_SECRET = 'AKIAIOSFODNN7EXAMPLEKEY1234567890';
const DB_PASSWORD = 'super_secret_password_123!';

// 8. Data Flow - Command Injection Chain
function executeTask(req, res) {
  const taskName = req.params.task; // Taint source
  const command = `run-task ${taskName}`; // Command construction
  const { execSync } = require('child_process');
  execSync(command); // CRITICAL: Command injection via taint flow
}

// 9. AST Detection - Weak Crypto
function generateToken() {
  // MEDIUM: Math.random is not cryptographically secure
  const token = Math.random().toString(36).substring(2);
  return token;
}

// 10. Data Flow - Path Traversal
function readUserFile(req, res) {
  const filename = req.query.file; // Taint source
  const path = `./uploads/${filename}`; // Path construction
  const fs = require('fs');
  fs.readFile(path, 'utf8'); // Path traversal vulnerability
}

// 11. Multiple vulnerabilities in one function
async function processPayment(req, res) {
  const amount = req.body.amount; // Taint source
  const userId = req.body.userId; // Taint source
  
  // SQL Injection
  const query = `UPDATE accounts SET balance = balance - ${amount} WHERE user_id = ${userId}`;
  await db.query(query);
  
  // XSS
  const message = `Payment of $${amount} processed`;
  res.send(`<div>${message}</div>`);
  
  // Hardcoded secret
  const stripeKey = 'placeholder_stripe_test_api_key';
  
  // Weak crypto
  const transactionId = Math.random().toString(36);
  
  return transactionId;
}

// 12. Framework-specific - Angular
// Would be detected by framework analyzer
function unsafeAngular(content) {
  this.sanitizer.bypassSecurityTrustHtml(content);
}

// 13. Framework-specific - Vue
// Would be detected by framework analyzer
// <div v-html="userContent"></div>

// 14. Data Flow - Multi-hop taint
function complexFlow(req, res) {
  const input1 = req.query.search; // Taint source
  const input2 = processInput(input1); // Propagation
  const input3 = formatData(input2); // Propagation
  executeQuery(input3); // Taint sink
}

function processInput(data) {
  return data.trim();
}

function formatData(data) {
  return `formatted_${data}`;
}

function executeQuery(data) {
  db.raw(`SELECT * FROM items WHERE name = '${data}'`); // SQL Injection
}

// 15. Secret detection - Different types
const secrets = {
  githubToken: 'ghp_1234567890abcdefghijklmnopqrstuvwxyz1234',
  jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
  slackToken: 'placeholder_slack_api_token',
  googleApiKey: 'AIzaSyB1234567890abcdefghijklmnopqrstuv',
  connectionString: 'mongodb://admin:password123@localhost:27017/mydb'
};

// This file contains 15+ different vulnerabilities that should be detected
// by the advanced AST and Data Flow analyzers!
