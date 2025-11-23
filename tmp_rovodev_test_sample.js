// Test file with various security issues
const apiKey = "sk_live_abcdef123456789";
const password = "hardcoded_password";

// SQL Injection vulnerability
function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return db.query(query);
}

// XSS vulnerability
function displayContent(userInput) {
  document.innerHTML = "<div>" + userInput + "</div>";
}

// Code injection
function executeCode(code) {
  eval(code);
}

// Insecure random
function generateToken() {
  return Math.random().toString(36);
}

// Hardcoded credentials
const dbConfig = {
  host: "localhost",
  user: "admin",
  password: "admin123",
  database: "myapp"
};
