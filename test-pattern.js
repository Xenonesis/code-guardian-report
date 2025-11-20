// Test pattern matching
const pattern1 = /SELECT.*FROM.*["'`]\s*\+|query.*["'`]\s*\+/gi;
const pattern2 = /\.query\(["'`].*["'`]\s*\+|\.execute\(["'`].*["'`]\s*\+/gi;

const testCases = [
  'const query = "SELECT * FROM users WHERE id = \'" + userId + "\'";',
  'connection.query(query, (err, results) => {',
  'db.query("SELECT * FROM users WHERE id = \'" + id + "\'");',
  'query = "SELECT * FROM users WHERE id = " + userId;'
];

console.log('\n=== Pattern 1: SQL String Concatenation ===');
console.log('Pattern:', pattern1);
testCases.forEach((code, i) => {
  const matches = code.match(pattern1);
  console.log(`\nTest ${i + 1}:`, code);
  console.log('Matches:', matches);
});

console.log('\n\n=== Pattern 2: Query Method with Concatenation ===');
console.log('Pattern:', pattern2);
testCases.forEach((code, i) => {
  const matches = code.match(pattern2);
  console.log(`\nTest ${i + 1}:`, code);
  console.log('Matches:', matches);
});
