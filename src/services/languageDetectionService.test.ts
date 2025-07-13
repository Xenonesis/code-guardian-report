import { describe, it, expect, beforeEach } from 'vitest';
import { LanguageDetectionService } from './languageDetectionService';

describe('LanguageDetectionService', () => {
  let service: LanguageDetectionService;

  beforeEach(() => {
    service = new LanguageDetectionService();
  });

  describe('Language Detection', () => {
    it('should detect JavaScript from file extension and content', async () => {
      const files = [
        {
          filename: 'app.js',
          content: `
            const express = require('express');
            const app = express();
            
            app.get('/', (req, res) => {
              res.send('Hello World!');
            });
            
            app.listen(3000, () => {
              console.log('Server running on port 3000');
            });
          `
        }
      ];

      const result = await service.analyzeCodebase(files);
      
      expect(result.primaryLanguage.name).toBe('javascript');
      expect(result.primaryLanguage.confidence).toBeGreaterThan(70);
      expect(result.primaryLanguage.ecosystem).toBe('web');
    });

    it('should detect TypeScript from file extension and content', async () => {
      const files = [
        {
          filename: 'user.service.ts',
          content: `
            interface User {
              id: number;
              name: string;
              email: string;
            }
            
            class UserService {
              private users: User[] = [];
              
              public addUser(user: User): void {
                this.users.push(user);
              }
              
              public getUser(id: number): User | undefined {
                return this.users.find(u => u.id === id);
              }
            }
          `
        }
      ];

      const result = await service.analyzeCodebase(files);
      
      expect(result.primaryLanguage.name).toBe('typescript');
      expect(result.primaryLanguage.confidence).toBeGreaterThan(70);
    });

    it('should detect Python from file extension and content', async () => {
      const files = [
        {
          filename: 'main.py',
          content: `
            def fibonacci(n):
                if n <= 1:
                    return n
                return fibonacci(n-1) + fibonacci(n-2)
            
            class Calculator:
                def __init__(self):
                    self.history = []
                
                def add(self, a, b):
                    result = a + b
                    self.history.append(f"{a} + {b} = {result}")
                    return result
            
            if __name__ == "__main__":
                calc = Calculator()
                print(calc.add(5, 3))
          `
        }
      ];

      const result = await service.analyzeCodebase(files);
      
      expect(result.primaryLanguage.name).toBe('python');
      expect(result.primaryLanguage.confidence).toBeGreaterThan(70);
      expect(result.primaryLanguage.ecosystem).toBe('backend');
    });

    it('should detect multiple languages in a polyglot project', async () => {
      const files = [
        {
          filename: 'frontend/app.js',
          content: 'const app = React.createElement("div", null, "Hello React");'
        },
        {
          filename: 'backend/server.py',
          content: 'from flask import Flask\napp = Flask(__name__)'
        },
        {
          filename: 'styles/main.css',
          content: '.container { display: flex; justify-content: center; }'
        }
      ];

      const result = await service.analyzeCodebase(files);
      
      expect(result.allLanguages.length).toBeGreaterThan(1);
      expect(result.allLanguages.some(lang => lang.name === 'javascript')).toBe(true);
      expect(result.allLanguages.some(lang => lang.name === 'python')).toBe(true);
    });
  });

  describe('Framework Detection', () => {
    it('should detect React framework', async () => {
      const files = [
        {
          filename: 'src/App.jsx',
          content: `
            import React, { useState } from 'react';
            
            function App() {
              const [count, setCount] = useState(0);
              
              return (
                <div className="App">
                  <button onClick={() => setCount(count + 1)}>
                    Count: {count}
                  </button>
                </div>
              );
            }
            
            export default App;
          `
        },
        {
          filename: 'package.json',
          content: JSON.stringify({
            dependencies: {
              react: '^18.0.0',
              'react-dom': '^18.0.0'
            }
          })
        }
      ];

      const result = await service.analyzeCodebase(files);
      
      expect(result.frameworks.some(fw => fw.name === 'React')).toBe(true);
      const reactFramework = result.frameworks.find(fw => fw.name === 'React');
      expect(reactFramework?.confidence).toBeGreaterThan(60);
      expect(reactFramework?.category).toBe('frontend');
    });

    it('should detect Vue.js framework', async () => {
      const files = [
        {
          filename: 'src/App.vue',
          content: `
            <template>
              <div id="app">
                <h1>{{ message }}</h1>
                <button @click="increment">Count: {{ count }}</button>
              </div>
            </template>
            
            <script>
            export default {
              data() {
                return {
                  message: 'Hello Vue!',
                  count: 0
                }
              },
              methods: {
                increment() {
                  this.count++
                }
              }
            }
            </script>
          `
        }
      ];

      const result = await service.analyzeCodebase(files);
      
      expect(result.frameworks.some(fw => fw.name === 'Vue.js')).toBe(true);
    });

    it('should detect Django framework', async () => {
      const files = [
        {
          filename: 'myproject/settings.py',
          content: `
            import os
            from django.conf import settings
            
            DEBUG = True
            ALLOWED_HOSTS = []
            
            INSTALLED_APPS = [
                'django.contrib.admin',
                'django.contrib.auth',
                'myapp',
            ]
          `
        },
        {
          filename: 'myapp/models.py',
          content: `
            from django.db import models
            
            class User(models.Model):
                name = models.CharField(max_length=100)
                email = models.EmailField()
                created_at = models.DateTimeField(auto_now_add=True)
          `
        }
      ];

      const result = await service.analyzeCodebase(files);
      
      expect(result.frameworks.some(fw => fw.name === 'Django')).toBe(true);
    });
  });

  describe('Project Structure Analysis', () => {
    it('should detect web application structure', async () => {
      const files = [
        { filename: 'public/index.html', content: '<html></html>' },
        { filename: 'src/components/Header.jsx', content: 'export default function Header() {}' },
        { filename: 'src/pages/Home.jsx', content: 'export default function Home() {}' },
        { filename: 'package.json', content: '{}' }
      ];

      const result = await service.analyzeCodebase(files);
      
      expect(result.projectStructure.type).toBe('web');
      expect(result.projectStructure.confidence).toBeGreaterThan(30);
    });

    it('should detect mobile application structure', async () => {
      const files = [
        { filename: 'android/app/build.gradle', content: 'android {}' },
        { filename: 'ios/Runner/Info.plist', content: '<plist></plist>' },
        { filename: 'lib/main.dart', content: 'void main() {}' },
        { filename: 'pubspec.yaml', content: 'name: myapp' }
      ];

      const result = await service.analyzeCodebase(files);
      
      expect(result.projectStructure.type).toBe('mobile');
    });

    it('should detect library structure', async () => {
      const files = [
        { filename: 'index.ts', content: 'export * from "./lib"' },
        { filename: 'lib/utils.ts', content: 'export function helper() {}' },
        { filename: 'dist/index.js', content: 'module.exports = {}' },
        { filename: 'tsconfig.json', content: '{}' },
        { filename: '.npmignore', content: 'src/' }
      ];

      const result = await service.analyzeCodebase(files);
      
      expect(result.projectStructure.type).toBe('library');
    });

    it('should detect microservice structure', async () => {
      const files = [
        { filename: 'Dockerfile', content: 'FROM node:16' },
        { filename: 'docker-compose.yml', content: 'version: "3"' },
        { filename: 'api/routes/users.js', content: 'router.get("/users")' },
        { filename: 'middleware/auth.js', content: 'module.exports = (req, res, next)' }
      ];

      const result = await service.analyzeCodebase(files);
      
      expect(result.projectStructure.type).toBe('microservice');
    });
  });

  describe('Build Tools and Package Managers', () => {
    it('should detect build tools', async () => {
      const files = [
        { filename: 'webpack.config.js', content: 'module.exports = {}' },
        { filename: 'vite.config.ts', content: 'export default {}' },
        { filename: 'rollup.config.js', content: 'export default {}' }
      ];

      const result = await service.analyzeCodebase(files);
      
      expect(result.buildTools).toContain('Webpack');
      expect(result.buildTools).toContain('Vite');
      expect(result.buildTools).toContain('Rollup');
    });

    it('should detect package managers', async () => {
      const files = [
        { filename: 'package.json', content: '{}' },
        { filename: 'yarn.lock', content: '' },
        { filename: 'requirements.txt', content: 'flask==2.0.0' },
        { filename: 'Cargo.toml', content: '[package]' }
      ];

      const result = await service.analyzeCodebase(files);
      
      expect(result.packageManagers).toContain('npm');
      expect(result.packageManagers).toContain('Yarn');
      expect(result.packageManagers).toContain('pip');
      expect(result.packageManagers).toContain('Cargo');
    });
  });

  describe('Utility Methods', () => {
    it('should generate language summary', async () => {
      const files = [
        {
          filename: 'app.js',
          content: 'const express = require("express");'
        }
      ];

      const result = await service.analyzeCodebase(files);
      const summary = service.getLanguageSummary(result);
      
      expect(summary).toContain('Primary: javascript');
      expect(summary).toContain('%');
    });

    it('should recommend appropriate tools', async () => {
      const files = [
        {
          filename: 'app.py',
          content: 'from flask import Flask'
        }
      ];

      const result = await service.analyzeCodebase(files);
      const tools = service.getRecommendedTools(result);
      
      expect(tools).toContain('Bandit');
      expect(tools).toContain('Semgrep');
      expect(tools).toContain('Secret Scanner');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty file list', async () => {
      const result = await service.analyzeCodebase([]);
      
      expect(result.primaryLanguage.name).toBe('unknown');
      expect(result.allLanguages).toHaveLength(0);
      expect(result.frameworks).toHaveLength(0);
      expect(result.totalFiles).toBe(0);
    });

    it('should handle files with unknown extensions', async () => {
      const files = [
        { filename: 'README.md', content: 'My Project\n\nThis is a readme file without any code patterns.' },
        { filename: 'config.ini', content: 'key=value\nother_key=other_value\nsection_name=data' }
      ];

      const result = await service.analyzeCodebase(files);

      expect(result.primaryLanguage.name).toBe('unknown');
    });

    it('should handle mixed content that could match multiple languages', async () => {
      const files = [
        {
          filename: 'script.js',
          content: `
            // This could be JavaScript or TypeScript
            const data = {
              name: "test",
              value: 42
            };
            
            function process(input) {
              return input.toString();
            }
          `
        }
      ];

      const result = await service.analyzeCodebase(files);
      
      expect(result.primaryLanguage.name).toBe('javascript');
      expect(result.primaryLanguage.confidence).toBeGreaterThan(0);
    });
  });
});
