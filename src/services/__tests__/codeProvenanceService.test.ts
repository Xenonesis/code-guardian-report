import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CodeProvenanceService } from '../codeProvenanceService';

// Mock crypto.subtle for testing
const mockCrypto = {
  subtle: {
    digest: vi.fn().mockImplementation((algorithm: string, data: Uint8Array) => {
      // Create different hashes for different inputs by using a simple hash function
      const input = new TextDecoder().decode(data);
      let hash = 0;
      for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }

      // Create a unique 32-byte hash based on the input
      const hashArray = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        hashArray[i] = (hash + i) % 256;
      }
      return Promise.resolve(hashArray.buffer);
    })
  }
};

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

describe('CodeProvenanceService', () => {
  let service: CodeProvenanceService;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    service = new CodeProvenanceService();
  });

  describe('initializeMonitoring', () => {
    it('should initialize monitoring for multiple files', async () => {
      const files = [
        { filename: 'test1.js', content: 'console.log("test1");' },
        { filename: 'test2.js', content: 'console.log("test2");' },
        { filename: 'config.env', content: 'API_KEY=secret' }
      ];

      await service.initializeMonitoring(files);

      const stats = service.getMonitoringStatistics();
      expect(stats.totalFiles).toBe(3);
      expect(stats.monitoringStatus).toBe(true);
      expect(stats.criticalFiles).toBe(1); // config.env should be marked as critical
    });

    it('should identify security-critical files', async () => {
      const files = [
        { filename: 'app.js', content: 'console.log("app");' },
        { filename: '.env', content: 'SECRET_KEY=abc123' },
        { filename: 'auth.js', content: 'function authenticate() {}' },
        { filename: 'package.json', content: '{"name": "test"}' }
      ];

      await service.initializeMonitoring(files);

      const stats = service.getMonitoringStatistics();
      expect(stats.criticalFiles).toBeGreaterThan(0);
    });
  });

  describe('addFileToMonitoring', () => {
    it('should add a file to monitoring and return an ID', async () => {
      const id = await service.addFileToMonitoring('test.js', 'console.log("test");');

      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);

      const stats = service.getMonitoringStatistics();
      expect(stats.totalFiles).toBe(1);
    });

    it('should calculate file checksum', async () => {
      const id = await service.addFileToMonitoring('test.js', 'console.log("test");');

      expect(mockCrypto.subtle.digest).toHaveBeenCalledWith('SHA-256', expect.any(Object));
    });

    it('should generate appropriate tags for files', async () => {
      await service.addFileToMonitoring('auth.js', 'function login(password) {}');
      await service.addFileToMonitoring('test.spec.js', 'describe("test", () => {});');
      await service.addFileToMonitoring('.env', 'SECRET=abc');

      // Files should be added with appropriate metadata
      const stats = service.getMonitoringStatistics();
      expect(stats.totalFiles).toBe(3);
    });
  });

  describe('verifyFileIntegrity', () => {
    it('should verify unchanged file integrity', async () => {
      const content = 'console.log("test");';
      await service.addFileToMonitoring('test.js', content);

      const result = await service.verifyFileIntegrity('test.js', content);

      expect(result.isValid).toBe(true);
      expect(result.record).toBeDefined();
      expect(result.changes).toBeUndefined();
      expect(result.alert).toBeUndefined();
    });

    it('should detect file modifications', async () => {
      const originalContent = 'console.log("test");';
      const modifiedContent = 'console.log("modified");';
      
      await service.addFileToMonitoring('test.js', originalContent);

      const result = await service.verifyFileIntegrity('test.js', modifiedContent);

      expect(result.isValid).toBe(false);
      expect(result.record).toBeDefined();
      expect(result.changes).toBeDefined();
      expect(result.changes!.length).toBeGreaterThan(0);
      expect(result.alert).toBeDefined();
    });

    it('should return invalid for non-monitored files', async () => {
      const result = await service.verifyFileIntegrity('nonexistent.js', 'content');

      expect(result.isValid).toBe(false);
      expect(result.record).toBeUndefined();
    });
  });

  describe('performIntegrityScan', () => {
    it('should scan all files and generate report', async () => {
      const originalFiles = [
        { filename: 'test1.js', content: 'console.log("test1");' },
        { filename: 'test2.js', content: 'console.log("test2");' }
      ];

      await service.initializeMonitoring(originalFiles);

      const modifiedFiles = [
        { filename: 'test1.js', content: 'console.log("modified");' },
        { filename: 'test2.js', content: 'console.log("test2");' }
      ];

      const report = await service.performIntegrityScan(modifiedFiles);

      expect(report.totalFiles).toBe(2);
      expect(report.integrityViolations).toBe(1);
      expect(report.alerts).toHaveLength(1);
      expect(report.riskScore).toBeGreaterThan(0);
    });

    it('should detect deleted files', async () => {
      const originalFiles = [
        { filename: 'test1.js', content: 'console.log("test1");' },
        { filename: 'test2.js', content: 'console.log("test2");' }
      ];

      await service.initializeMonitoring(originalFiles);

      const remainingFiles = [
        { filename: 'test1.js', content: 'console.log("test1");' }
      ];

      const report = await service.performIntegrityScan(remainingFiles);

      expect(report.integrityViolations).toBe(1);
      expect(report.alerts[0].alertType).toBe('deletion');
    });

    it('should detect suspicious new files', async () => {
      await service.initializeMonitoring([]);

      const newFiles = [
        { filename: 'malicious.exe', content: 'binary content' },
        { filename: 'script.js', content: 'eval(userInput);' }
      ];

      const report = await service.performIntegrityScan(newFiles);

      expect(report.integrityViolations).toBeGreaterThan(0);
      expect(report.alerts.some(alert => alert.alertType === 'suspicious_pattern')).toBe(true);
    });
  });

  describe('alert management', () => {
    it('should get alerts with filtering', async () => {
      await service.initializeMonitoring([
        { filename: 'critical.env', content: 'SECRET=abc' }
      ]);

      await service.performIntegrityScan([
        { filename: 'critical.env', content: 'SECRET=modified' }
      ]);

      const allAlerts = service.getAlerts();
      const criticalAlerts = service.getAlerts('critical');

      expect(allAlerts.length).toBeGreaterThan(0);
      expect(criticalAlerts.every(alert => alert.severity === 'critical')).toBe(true);
    });

    it('should resolve alerts', async () => {
      await service.initializeMonitoring([
        { filename: 'test.js', content: 'console.log("test");' }
      ]);

      await service.performIntegrityScan([
        { filename: 'test.js', content: 'console.log("modified");' }
      ]);

      const alerts = service.getAlerts();
      expect(alerts.length).toBe(1);

      const success = service.resolveAlert(alerts[0].id);
      expect(success).toBe(true);

      const remainingAlerts = service.getAlerts();
      expect(remainingAlerts.length).toBe(0);
    });

    it('should fail to resolve non-existent alert', () => {
      const success = service.resolveAlert('non-existent-id');
      expect(success).toBe(false);
    });
  });

  describe('updateBaseline', () => {
    it('should update baseline for existing file', async () => {
      const originalContent = 'console.log("test");';
      const newContent = 'console.log("updated");';

      await service.addFileToMonitoring('test.js', originalContent);

      const success = await service.updateBaseline('test.js', newContent);
      expect(success).toBe(true);

      // Verify the new content is now considered valid
      const result = await service.verifyFileIntegrity('test.js', newContent);
      expect(result.isValid).toBe(true);
    });

    it('should fail to update baseline for non-existent file', async () => {
      const success = await service.updateBaseline('nonexistent.js', 'content');
      expect(success).toBe(false);
    });
  });

  describe('getMonitoringStatistics', () => {
    it('should return comprehensive statistics', async () => {
      const files = [
        { filename: 'app.js', content: 'console.log("app");' },
        { filename: '.env', content: 'SECRET=abc' },
        { filename: 'test.js', content: 'console.log("test");' }
      ];

      await service.initializeMonitoring(files);

      const stats = service.getMonitoringStatistics();

      expect(stats).toHaveProperty('totalFiles');
      expect(stats).toHaveProperty('criticalFiles');
      expect(stats).toHaveProperty('alertCount');
      expect(stats).toHaveProperty('lastScanTime');
      expect(stats).toHaveProperty('monitoringStatus');

      expect(stats.totalFiles).toBe(3);
      expect(stats.criticalFiles).toBeGreaterThan(0);
      expect(stats.monitoringStatus).toBe(true);
    });
  });

  describe('data persistence', () => {
    it('should save data to localStorage', async () => {
      await service.initializeMonitoring([
        { filename: 'test.js', content: 'console.log("test");' }
      ]);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'codeProvenance',
        expect.any(String)
      );
    });

    it('should load data from localStorage', () => {
      const mockData = {
        fileRecords: [['id1', { id: 'id1', filename: 'test.js' }]],
        alerts: [],
        monitoringEnabled: true
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));

      const newService = new CodeProvenanceService();
      const stats = newService.getMonitoringStatistics();

      expect(stats.totalFiles).toBe(1);
      expect(stats.monitoringStatus).toBe(true);
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      expect(() => new CodeProvenanceService()).not.toThrow();
    });
  });

  describe('security critical file detection', () => {
    it('should identify environment files as critical', async () => {
      await service.addFileToMonitoring('.env', 'SECRET=abc');
      await service.addFileToMonitoring('config.env', 'API_KEY=xyz');

      const stats = service.getMonitoringStatistics();
      expect(stats.criticalFiles).toBe(2);
    });

    it('should identify authentication files as critical', async () => {
      await service.addFileToMonitoring('auth.js', 'function authenticate() {}');
      await service.addFileToMonitoring('security.py', 'def hash_password(): pass');

      const stats = service.getMonitoringStatistics();
      expect(stats.criticalFiles).toBe(2);
    });

    it('should identify configuration files as critical', async () => {
      await service.addFileToMonitoring('package.json', '{"name": "test"}');
      await service.addFileToMonitoring('requirements.txt', 'flask==1.0');

      const stats = service.getMonitoringStatistics();
      expect(stats.criticalFiles).toBe(2);
    });
  });

  describe('risk assessment', () => {
    it('should calculate risk scores based on violations', async () => {
      await service.initializeMonitoring([
        { filename: 'critical.env', content: 'SECRET=abc' },
        { filename: 'app.js', content: 'console.log("app");' }
      ]);

      // Modify critical file
      const report = await service.performIntegrityScan([
        { filename: 'critical.env', content: 'SECRET=modified' },
        { filename: 'app.js', content: 'console.log("app");' }
      ]);

      expect(report.riskScore).toBeGreaterThan(0);
      expect(report.riskScore).toBeLessThanOrEqual(100);
    });

    it('should have higher risk for critical file violations', async () => {
      // Test critical file violation
      await service.initializeMonitoring([
        { filename: 'critical.env', content: 'SECRET=abc' }
      ]);

      const criticalReport = await service.performIntegrityScan([
        { filename: 'critical.env', content: 'SECRET=modified' }
      ]);

      // Create new service for normal file test
      const normalService = new CodeProvenanceService();
      await normalService.initializeMonitoring([
        { filename: 'normal.js', content: 'console.log("normal");' }
      ]);

      const normalReport = await normalService.performIntegrityScan([
        { filename: 'normal.js', content: 'console.log("modified");' }
      ]);

      expect(criticalReport.riskScore).toBeGreaterThan(normalReport.riskScore);
    });
  });
});
