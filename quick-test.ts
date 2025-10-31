import { modernCodeScanningService } from './src/services/security/modernCodeScanningService.js';

// Test various SQL injection patterns
const sql1 = `db.query("SELECT * FROM users WHERE id = " + userId);`;
const sql2 = `execute("DELETE FROM users WHERE id = '" + id + "'");`;
const sql3 = `conn.exec(\`SELECT * FROM data WHERE name = \${name}\`);`;

console.log('Testing SQL Injection Detection:');
console.log('Pattern 1:', modernCodeScanningService.analyzeCode(sql1, 'test.ts', 'typescript').issues.some(i => i.rule.id === 'typescript:S2077') ? '✅' : '❌');
console.log('Pattern 2:', modernCodeScanningService.analyzeCode(sql2, 'test.ts', 'typescript').issues.some(i => i.rule.id === 'typescript:S2077') ? '✅' : '❌');
console.log('Pattern 3:', modernCodeScanningService.analyzeCode(sql3, 'test.ts', 'typescript').issues.some(i => i.rule.id === 'typescript:S2077') ? '✅' : '❌');

