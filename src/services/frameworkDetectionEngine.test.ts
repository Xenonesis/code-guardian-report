import { describe, it, expect, beforeEach } from 'vitest';
import { FrameworkDetectionEngine, DependencyInfo } from './frameworkDetectionEngine';

describe('FrameworkDetectionEngine', () => {
  let engine: FrameworkDetectionEngine;

  beforeEach(() => {
    engine = new FrameworkDetectionEngine();
  });

  describe('React Detection', () => {
    it('should detect React from JSX files and dependencies', () => {
      const files = [
        {
          filename: 'src/App.jsx',
          content: `
            import React from 'react';
            
            function App() {
              return <div className="app">Hello React</div>;
            }
          `
        }
      ];

      const dependencies: DependencyInfo[] = [
        { name: 'react', version: '^18.0.0', type: 'dependency', ecosystem: 'npm' },
        { name: 'react-dom', version: '^18.0.0', type: 'dependency', ecosystem: 'npm' }
      ];

      const result = engine.detectFrameworks(files, dependencies);
      
      expect(result.frameworks.some(fw => fw.name === 'React')).toBe(true);
      const reactFramework = result.frameworks.find(fw => fw.name === 'React');
      expect(reactFramework?.confidence).toBeGreaterThan(70);
      expect(reactFramework?.category).toBe('frontend');
      expect(reactFramework?.language).toBe('javascript');
    });

    it('should detect Next.js from config and imports', () => {
      const files = [
        {
          filename: 'next.config.js',
          content: `
            module.exports = {
              reactStrictMode: true,
            }
          `
        },
        {
          filename: 'pages/index.js',
          content: `
            import { GetServerSideProps } from 'next';
            
            export default function Home() {
              return <div>Next.js App</div>;
            }
            
            export const getServerSideProps = async () => {
              return { props: {} };
            }
          `
        }
      ];

      const result = engine.detectFrameworks(files);
      
      expect(result.frameworks.some(fw => fw.name === 'Next.js')).toBe(true);
      const nextFramework = result.frameworks.find(fw => fw.name === 'Next.js');
      expect(nextFramework?.category).toBe('fullstack');
    });
  });

  describe('Vue.js Detection', () => {
    it('should detect Vue.js from .vue files', () => {
      const files = [
        {
          filename: 'src/components/HelloWorld.vue',
          content: `
            <template>
              <div class="hello">
                <h1>{{ msg }}</h1>
              </div>
            </template>
            
            <script>
            export default {
              name: 'HelloWorld',
              props: {
                msg: String
              }
            }
            </script>
            
            <style scoped>
            .hello {
              color: #42b983;
            }
            </style>
          `
        }
      ];

      const result = engine.detectFrameworks(files);
      
      expect(result.frameworks.some(fw => fw.name === 'Vue.js')).toBe(true);
    });

    it('should detect Nuxt.js from config and structure', () => {
      const files = [
        {
          filename: 'nuxt.config.ts',
          content: `
            export default defineNuxtConfig({
              devtools: { enabled: true }
            })
          `
        },
        {
          filename: 'pages/index.vue',
          content: `
            <template>
              <div>Nuxt.js Page</div>
            </template>
          `
        }
      ];

      const result = engine.detectFrameworks(files);
      
      expect(result.frameworks.some(fw => fw.name === 'Nuxt.js')).toBe(true);
    });
  });

  describe('Angular Detection', () => {
    it('should detect Angular from decorators and config', () => {
      const files = [
        {
          filename: 'angular.json',
          content: JSON.stringify({
            projects: {
              'my-app': {
                architect: {
                  build: {
                    builder: '@angular-devkit/build-angular:browser'
                  }
                }
              }
            }
          })
        },
        {
          filename: 'src/app/app.component.ts',
          content: `
            import { Component } from '@angular/core';
            
            @Component({
              selector: 'app-root',
              templateUrl: './app.component.html',
              styleUrls: ['./app.component.css']
            })
            export class AppComponent {
              title = 'my-app';
            }
          `
        }
      ];

      const result = engine.detectFrameworks(files);
      
      expect(result.frameworks.some(fw => fw.name === 'Angular')).toBe(true);
      const angularFramework = result.frameworks.find(fw => fw.name === 'Angular');
      expect(angularFramework?.language).toBe('typescript');
    });
  });

  describe('Backend Framework Detection', () => {
    it('should detect Express.js', () => {
      const files = [
        {
          filename: 'server.js',
          content: `
            const express = require('express');
            const app = express();
            
            app.get('/', (req, res) => {
              res.send('Hello World!');
            });
            
            app.listen(3000);
          `
        }
      ];

      const result = engine.detectFrameworks(files);
      
      expect(result.frameworks.some(fw => fw.name === 'Express.js')).toBe(true);
      const expressFramework = result.frameworks.find(fw => fw.name === 'Express.js');
      expect(expressFramework?.category).toBe('backend');
    });

    it('should detect NestJS from decorators', () => {
      const files = [
        {
          filename: 'src/app.controller.ts',
          content: `
            import { Controller, Get } from '@nestjs/common';
            
            @Controller()
            export class AppController {
              @Get()
              getHello(): string {
                return 'Hello World!';
              }
            }
          `
        }
      ];

      const result = engine.detectFrameworks(files);
      
      expect(result.frameworks.some(fw => fw.name === 'NestJS')).toBe(true);
    });

    it('should detect Django from imports and structure', () => {
      const files = [
        {
          filename: 'manage.py',
          content: `
            import os
            import sys
            
            if __name__ == '__main__':
                os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
          `
        },
        {
          filename: 'myapp/models.py',
          content: `
            from django.db import models
            
            class User(models.Model):
                name = models.CharField(max_length=100)
          `
        }
      ];

      const result = engine.detectFrameworks(files);
      
      expect(result.frameworks.some(fw => fw.name === 'Django')).toBe(true);
    });

    it('should detect Flask from imports', () => {
      const files = [
        {
          filename: 'app.py',
          content: `
            from flask import Flask, request, jsonify
            
            app = Flask(__name__)
            
            @app.route('/')
            def hello():
                return 'Hello, World!'
          `
        }
      ];

      const result = engine.detectFrameworks(files);
      
      expect(result.frameworks.some(fw => fw.name === 'Flask')).toBe(true);
    });

    it('should detect Spring Boot from annotations', () => {
      const files = [
        {
          filename: 'src/main/java/com/example/Application.java',
          content: `
            package com.example;
            
            import org.springframework.boot.SpringApplication;
            import org.springframework.boot.autoconfigure.SpringBootApplication;
            
            @SpringBootApplication
            public class Application {
                public static void main(String[] args) {
                    SpringApplication.run(Application.class, args);
                }
            }
          `
        }
      ];

      const result = engine.detectFrameworks(files);
      
      expect(result.frameworks.some(fw => fw.name === 'Spring Boot')).toBe(true);
    });
  });

  describe('Mobile Framework Detection', () => {
    it('should detect React Native', () => {
      const files = [
        {
          filename: 'App.js',
          content: `
            import React from 'react';
            import { StyleSheet, Text, View } from 'react-native';
            
            export default function App() {
              return (
                <View style={styles.container}>
                  <Text>Hello React Native!</Text>
                </View>
              );
            }
            
            const styles = StyleSheet.create({
              container: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              },
            });
          `
        }
      ];

      const result = engine.detectFrameworks(files);
      
      expect(result.frameworks.some(fw => fw.name === 'React Native')).toBe(true);
      const rnFramework = result.frameworks.find(fw => fw.name === 'React Native');
      expect(rnFramework?.category).toBe('mobile');
    });

    it('should detect Flutter from Dart files', () => {
      const files = [
        {
          filename: 'lib/main.dart',
          content: `
            import 'package:flutter/material.dart';
            
            void main() {
              runApp(MyApp());
            }
            
            class MyApp extends StatelessWidget {
              @override
              Widget build(BuildContext context) {
                return MaterialApp(
                  home: Scaffold(
                    body: Center(child: Text('Hello Flutter!')),
                  ),
                );
              }
            }
          `
        },
        {
          filename: 'pubspec.yaml',
          content: `
            name: my_flutter_app
            dependencies:
              flutter:
                sdk: flutter
          `
        }
      ];

      const result = engine.detectFrameworks(files);
      
      expect(result.frameworks.some(fw => fw.name === 'Flutter')).toBe(true);
    });
  });

  describe('Dependency Parsing', () => {
    it('should parse package.json dependencies correctly', () => {
      const packageJsonContent = JSON.stringify({
        dependencies: {
          'react': '^18.0.0',
          'express': '^4.18.0'
        },
        devDependencies: {
          'typescript': '^4.9.0',
          '@types/react': '^18.0.0'
        },
        peerDependencies: {
          'react-dom': '^18.0.0'
        }
      });

      const dependencies = engine.parseDependencies(packageJsonContent);
      
      expect(dependencies).toHaveLength(5);
      expect(dependencies.some(dep => dep.name === 'react' && dep.type === 'dependency')).toBe(true);
      expect(dependencies.some(dep => dep.name === 'typescript' && dep.type === 'devDependency')).toBe(true);
      expect(dependencies.some(dep => dep.name === 'react-dom' && dep.type === 'peerDependency')).toBe(true);
    });

    it('should handle malformed package.json gracefully', () => {
      const malformedJson = '{ "dependencies": { "react": }';
      
      const dependencies = engine.parseDependencies(malformedJson);
      
      expect(dependencies).toHaveLength(0);
    });
  });

  describe('Custom Patterns', () => {
    it('should allow adding custom framework patterns', () => {
      const customPattern = {
        name: 'CustomFramework',
        language: 'javascript',
        category: 'frontend' as const,
        ecosystem: 'web',
        filePatterns: ['*.custom.js'],
        contentPatterns: [/CustomFramework\./],
        dependencies: ['custom-framework'],
        configFiles: ['custom.config.js'],
        directoryStructure: ['custom/'],
        minimumConfidence: 50
      };

      engine.addCustomPattern(customPattern);
      
      const files = [
        {
          filename: 'app.custom.js',
          content: 'CustomFramework.init();'
        }
      ];

      const result = engine.detectFrameworks(files);
      
      expect(result.frameworks.some(fw => fw.name === 'CustomFramework')).toBe(true);
    });
  });

  describe('Utility Methods', () => {
    it('should return list of supported frameworks', () => {
      const supportedFrameworks = engine.getSupportedFrameworks();
      
      expect(supportedFrameworks).toContain('React');
      expect(supportedFrameworks).toContain('Vue.js');
      expect(supportedFrameworks).toContain('Angular');
      expect(supportedFrameworks).toContain('Django');
      expect(supportedFrameworks).toContain('Express.js');
      expect(supportedFrameworks.length).toBeGreaterThan(10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty file list', () => {
      const result = engine.detectFrameworks([]);
      
      expect(result.frameworks).toHaveLength(0);
      expect(result.confidence).toBe(0);
    });

    it('should handle files with no matching patterns', () => {
      const files = [
        {
          filename: 'README.md',
          content: '# My Project\n\nThis is a readme file.'
        }
      ];

      const result = engine.detectFrameworks(files);
      
      expect(result.frameworks).toHaveLength(0);
    });

    it('should prioritize frameworks with higher confidence', () => {
      const files = [
        {
          filename: 'app.js',
          content: 'const express = require("express"); const app = express();'
        },
        {
          filename: 'package.json',
          content: JSON.stringify({
            dependencies: {
              express: '^4.18.0',
              react: '^18.0.0'
            }
          })
        }
      ];

      const dependencies = engine.parseDependencies(files[1].content);
      const result = engine.detectFrameworks(files, dependencies);
      
      // Express should have higher confidence due to both file content and dependencies
      const expressFramework = result.frameworks.find(fw => fw.name === 'Express.js');
      const reactFramework = result.frameworks.find(fw => fw.name === 'React');
      
      if (expressFramework && reactFramework) {
        expect(expressFramework.confidence).toBeGreaterThan(reactFramework.confidence);
      }
    });
  });
});
