export interface FileIntegrityRecord {
  id: string;
  filename: string;
  filepath: string;
  checksum: string;
  algorithm: 'SHA-256' | 'SHA-512' | 'MD5';
  size: number;
  lastModified: Date;
  isSecurityCritical: boolean;
  baseline: boolean;
  tags: string[];
  metadata: {
    language?: string;
    framework?: string;
    category: 'source' | 'config' | 'dependency' | 'build' | 'security';
    importance: 'critical' | 'high' | 'medium' | 'low';
  };
}

export interface TamperingAlert {
  id: string;
  fileId: string;
  filename: string;
  alertType: 'modification' | 'deletion' | 'unauthorized_access' | 'suspicious_pattern';
  severity: 'critical' | 'high' | 'medium' | 'low';
  detectedAt: Date;
  description: string;
  changes: FileChange[];
  riskAssessment: string;
  recommendedActions: string[];
  falsePositiveRisk: number; // 0-100
}

export interface FileChange {
  type: 'content' | 'permissions' | 'metadata' | 'location';
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: Date;
  confidence: number; // 0-100
}

export interface ProvenanceReport {
  totalFiles: number;
  monitoredFiles: number;
  criticalFiles: number;
  integrityViolations: number;
  lastScanTime: Date;
  alerts: TamperingAlert[];
  fileStatistics: {
    byCategory: Record<string, number>;
    byImportance: Record<string, number>;
    byLanguage: Record<string, number>;
  };
  riskScore: number; // 0-100
}

export class CodeProvenanceService {
  private fileRecords: Map<string, FileIntegrityRecord> = new Map();
  private alerts: TamperingAlert[] = [];
  private monitoringEnabled = false;
  private scanInterval: number | null = null;

  constructor() {
    this.loadStoredData();
  }

  /**
   * Initialize file integrity monitoring for a codebase
   */
  public async initializeMonitoring(
    files: { filename: string; content: string; path?: string }[]
  ): Promise<void> {
    console.log('Initializing code provenance monitoring...');

    for (const file of files) {
      await this.addFileToMonitoring(file.filename, file.content, file.path);
    }

    this.monitoringEnabled = true;
    this.saveData();
    
    console.log(`Monitoring initialized for ${files.length} files`);
  }

  /**
   * Add a file to integrity monitoring
   */
  public async addFileToMonitoring(
    filename: string,
    content: string,
    filepath?: string
  ): Promise<string> {
    const checksum = await this.calculateChecksum(content);
    const isSecurityCritical = this.isSecurityCriticalFile(filename);
    
    const record: FileIntegrityRecord = {
      id: this.generateId(),
      filename,
      filepath: filepath || filename,
      checksum,
      algorithm: 'SHA-256',
      size: content.length,
      lastModified: new Date(),
      isSecurityCritical,
      baseline: true,
      tags: this.generateFileTags(filename, content),
      metadata: this.analyzeFileMetadata(filename, content)
    };

    this.fileRecords.set(record.id, record);
    return record.id;
  }

  /**
   * Verify file integrity against baseline
   */
  public async verifyFileIntegrity(
    filename: string,
    currentContent: string
  ): Promise<{
    isValid: boolean;
    record?: FileIntegrityRecord;
    changes?: FileChange[];
    alert?: TamperingAlert;
  }> {
    const record = this.findFileRecord(filename);
    
    if (!record) {
      return { isValid: false };
    }

    const currentChecksum = await this.calculateChecksum(currentContent);
    const isValid = currentChecksum === record.checksum;

    if (!isValid) {
      const changes = await this.detectChanges(record, currentContent);
      const alert = this.createTamperingAlert(record, changes);
      
      this.alerts.push(alert);
      this.saveData();

      return {
        isValid: false,
        record,
        changes,
        alert
      };
    }

    return { isValid: true, record };
  }

  /**
   * Scan all monitored files for integrity violations
   */
  public async performIntegrityScan(
    currentFiles: { filename: string; content: string }[]
  ): Promise<ProvenanceReport> {
    const violations: TamperingAlert[] = [];
    const fileMap = new Map(currentFiles.map(f => [f.filename, f.content]));

    // Check existing files for modifications
    for (const record of this.fileRecords.values()) {
      const currentContent = fileMap.get(record.filename);
      
      if (!currentContent) {
        // File was deleted
        const alert = this.createDeletionAlert(record);
        violations.push(alert);
        this.alerts.push(alert);
        continue;
      }

      const verification = await this.verifyFileIntegrity(record.filename, currentContent);
      if (!verification.isValid && verification.alert) {
        violations.push(verification.alert);
      }
    }

    // Check for new files that might be suspicious
    for (const file of currentFiles) {
      if (!this.findFileRecord(file.filename)) {
        const suspiciousPatterns = this.detectSuspiciousPatterns(file.filename, file.content);
        if (suspiciousPatterns.length > 0) {
          const alert = this.createSuspiciousFileAlert(file.filename, suspiciousPatterns);
          violations.push(alert);
          this.alerts.push(alert);
        }
      }
    }

    const report = this.generateProvenanceReport(violations);
    this.saveData();
    
    return report;
  }

  /**
   * Get all tampering alerts
   */
  public getAlerts(
    severity?: 'critical' | 'high' | 'medium' | 'low',
    limit?: number
  ): TamperingAlert[] {
    let filteredAlerts = this.alerts;

    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }

    // Sort by detection time (newest first)
    filteredAlerts.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());

    if (limit) {
      filteredAlerts = filteredAlerts.slice(0, limit);
    }

    return filteredAlerts;
  }

  /**
   * Mark an alert as resolved
   */
  public resolveAlert(alertId: string): boolean {
    const index = this.alerts.findIndex(alert => alert.id === alertId);
    if (index === -1) return false;

    this.alerts.splice(index, 1);
    this.saveData();
    return true;
  }

  /**
   * Update baseline for a file
   */
  public async updateBaseline(filename: string, newContent: string): Promise<boolean> {
    const record = this.findFileRecord(filename);
    if (!record) return false;

    const newChecksum = await this.calculateChecksum(newContent);
    
    record.checksum = newChecksum;
    record.size = newContent.length;
    record.lastModified = new Date();
    record.baseline = true;

    this.saveData();
    return true;
  }

  /**
   * Get monitoring statistics
   */
  public getMonitoringStatistics(): {
    totalFiles: number;
    criticalFiles: number;
    alertCount: number;
    lastScanTime: Date | null;
    monitoringStatus: boolean;
  } {
    const criticalFiles = Array.from(this.fileRecords.values())
      .filter(record => record.isSecurityCritical).length;

    return {
      totalFiles: this.fileRecords.size,
      criticalFiles,
      alertCount: this.alerts.length,
      lastScanTime: this.alerts.length > 0 ? 
        new Date(Math.max(...this.alerts.map(a => a.detectedAt.getTime()))) : null,
      monitoringStatus: this.monitoringEnabled
    };
  }

  /**
   * Calculate file checksum using SHA-256
   */
  private async calculateChecksum(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Determine if a file is security-critical
   */
  private isSecurityCriticalFile(filename: string): boolean {
    const criticalPatterns = [
      /\.(env|config|key|pem|p12|jks)$/i,
      /^(auth|security|crypto|ssl|tls)/i,
      /(password|secret|token|api[_-]?key)/i,
      /\.(htaccess|htpasswd)$/i,
      /(dockerfile|docker-compose)/i,
      /^(package\.json|requirements\.txt|Gemfile|pom\.xml)$/i,
      /(webpack|babel|eslint)\.config/i
    ];

    return criticalPatterns.some(pattern => pattern.test(filename));
  }

  /**
   * Generate tags for a file based on its characteristics
   */
  private generateFileTags(filename: string, content: string): string[] {
    const tags: string[] = [];

    // File type tags
    const extension = filename.split('.').pop()?.toLowerCase();
    if (extension) tags.push(`ext:${extension}`);

    // Content-based tags
    if (content.includes('password') || content.includes('secret')) tags.push('credentials');
    if (content.includes('import') || content.includes('require')) tags.push('dependencies');
    if (content.includes('export') || content.includes('module.exports')) tags.push('module');
    if (content.includes('function') || content.includes('class')) tags.push('code');
    if (content.includes('test') || content.includes('spec')) tags.push('test');

    // Security-related tags
    if (this.isSecurityCriticalFile(filename)) tags.push('security-critical');
    if (content.includes('crypto') || content.includes('hash')) tags.push('cryptography');
    if (content.includes('auth') || content.includes('login')) tags.push('authentication');

    return tags;
  }

  /**
   * Analyze file metadata
   */
  private analyzeFileMetadata(filename: string, content: string): FileIntegrityRecord['metadata'] {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    // Determine language
    const languageMap: Record<string, string> = {
      'js': 'javascript', 'ts': 'typescript', 'py': 'python',
      'java': 'java', 'php': 'php', 'rb': 'ruby', 'go': 'golang',
      'cs': 'csharp', 'cpp': 'cpp', 'c': 'c'
    };

    // Determine category
    let category: 'source' | 'config' | 'dependency' | 'build' | 'security' = 'source';
    if (/\.(json|yaml|yml|xml|ini|conf|config)$/i.test(filename)) category = 'config';
    if (/package\.json|requirements\.txt|Gemfile|pom\.xml/i.test(filename)) category = 'dependency';
    if (/webpack|babel|gulp|grunt|Makefile|Dockerfile/i.test(filename)) category = 'build';
    if (this.isSecurityCriticalFile(filename)) category = 'security';

    // Determine importance
    let importance: 'critical' | 'high' | 'medium' | 'low' = 'medium';
    if (this.isSecurityCriticalFile(filename)) importance = 'critical';
    else if (category === 'dependency' || category === 'build') importance = 'high';
    else if (content.includes('main') || content.includes('index')) importance = 'high';

    return {
      language: extension ? languageMap[extension] : undefined,
      category,
      importance
    };
  }

  /**
   * Find file record by filename
   */
  private findFileRecord(filename: string): FileIntegrityRecord | undefined {
    return Array.from(this.fileRecords.values())
      .find(record => record.filename === filename);
  }

  /**
   * Detect changes between baseline and current content
   */
  private async detectChanges(
    record: FileIntegrityRecord,
    currentContent: string
  ): Promise<FileChange[]> {
    const changes: FileChange[] = [];

    // Size change
    if (currentContent.length !== record.size) {
      changes.push({
        type: 'content',
        field: 'size',
        oldValue: record.size.toString(),
        newValue: currentContent.length.toString(),
        timestamp: new Date(),
        confidence: 100
      });
    }

    // Content change (already detected via checksum)
    changes.push({
      type: 'content',
      field: 'checksum',
      oldValue: record.checksum,
      newValue: await this.calculateChecksum(currentContent),
      timestamp: new Date(),
      confidence: 100
    });

    return changes;
  }

  /**
   * Create tampering alert for modified file
   */
  private createTamperingAlert(
    record: FileIntegrityRecord,
    changes: FileChange[]
  ): TamperingAlert {
    const severity = record.isSecurityCritical ? 'critical' : 'high';
    
    return {
      id: this.generateId(),
      fileId: record.id,
      filename: record.filename,
      alertType: 'modification',
      severity,
      detectedAt: new Date(),
      description: `File ${record.filename} has been modified since baseline`,
      changes,
      riskAssessment: record.isSecurityCritical 
        ? 'High risk: Security-critical file has been modified'
        : 'Medium risk: Monitored file has been modified',
      recommendedActions: [
        'Review changes for unauthorized modifications',
        'Verify changes are legitimate',
        'Update baseline if changes are approved',
        record.isSecurityCritical ? 'Perform security audit' : 'Monitor for additional changes'
      ],
      falsePositiveRisk: record.isSecurityCritical ? 10 : 30
    };
  }

  /**
   * Create alert for deleted file
   */
  private createDeletionAlert(record: FileIntegrityRecord): TamperingAlert {
    return {
      id: this.generateId(),
      fileId: record.id,
      filename: record.filename,
      alertType: 'deletion',
      severity: record.isSecurityCritical ? 'critical' : 'medium',
      detectedAt: new Date(),
      description: `Monitored file ${record.filename} has been deleted`,
      changes: [{
        type: 'content',
        field: 'existence',
        oldValue: 'present',
        newValue: 'deleted',
        timestamp: new Date(),
        confidence: 100
      }],
      riskAssessment: 'File deletion detected - potential security incident',
      recommendedActions: [
        'Investigate reason for file deletion',
        'Check if deletion was authorized',
        'Restore file if deletion was unauthorized',
        'Review access logs'
      ],
      falsePositiveRisk: 5
    };
  }

  /**
   * Detect suspicious patterns in new files
   */
  private detectSuspiciousPatterns(filename: string, content: string): string[] {
    const patterns: string[] = [];

    // Suspicious file patterns
    if (/\.(exe|bat|cmd|sh|ps1)$/i.test(filename)) {
      patterns.push('Executable file detected');
    }

    // Suspicious content patterns
    if (content.includes('eval(') || content.includes('exec(')) {
      patterns.push('Dynamic code execution detected');
    }

    if (content.includes('base64') && content.includes('decode')) {
      patterns.push('Base64 decoding detected');
    }

    if (/password|secret|key|token/i.test(content) && !/test|example|demo/i.test(filename)) {
      patterns.push('Potential credentials in code');
    }

    return patterns;
  }

  /**
   * Create alert for suspicious new file
   */
  private createSuspiciousFileAlert(filename: string, patterns: string[]): TamperingAlert {
    return {
      id: this.generateId(),
      fileId: '',
      filename,
      alertType: 'suspicious_pattern',
      severity: 'medium',
      detectedAt: new Date(),
      description: `New file ${filename} contains suspicious patterns`,
      changes: [],
      riskAssessment: `Suspicious patterns detected: ${patterns.join(', ')}`,
      recommendedActions: [
        'Review file contents for malicious code',
        'Verify file source and legitimacy',
        'Scan file with security tools',
        'Add to monitoring if legitimate'
      ],
      falsePositiveRisk: 60
    };
  }

  /**
   * Generate comprehensive provenance report
   */
  private generateProvenanceReport(newViolations: TamperingAlert[]): ProvenanceReport {
    const allRecords = Array.from(this.fileRecords.values());
    const criticalFiles = allRecords.filter(r => r.isSecurityCritical).length;

    // Calculate statistics
    const fileStatistics = {
      byCategory: {} as Record<string, number>,
      byImportance: {} as Record<string, number>,
      byLanguage: {} as Record<string, number>
    };

    allRecords.forEach(record => {
      const category = record.metadata.category;
      const importance = record.metadata.importance;
      const language = record.metadata.language || 'unknown';

      fileStatistics.byCategory[category] = (fileStatistics.byCategory[category] || 0) + 1;
      fileStatistics.byImportance[importance] = (fileStatistics.byImportance[importance] || 0) + 1;
      fileStatistics.byLanguage[language] = (fileStatistics.byLanguage[language] || 0) + 1;
    });

    // Calculate risk score
    const criticalAlerts = this.alerts.filter(a => a.severity === 'critical').length;
    const highAlerts = this.alerts.filter(a => a.severity === 'high').length;
    const riskScore = Math.min(100, (criticalAlerts * 25) + (highAlerts * 10) + (newViolations.length * 5));

    return {
      totalFiles: allRecords.length,
      monitoredFiles: allRecords.length,
      criticalFiles,
      integrityViolations: newViolations.length,
      lastScanTime: new Date(),
      alerts: newViolations,
      fileStatistics,
      riskScore
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save data to localStorage
   */
  private saveData(): void {
    try {
      const data = {
        fileRecords: Array.from(this.fileRecords.entries()),
        alerts: this.alerts,
        monitoringEnabled: this.monitoringEnabled
      };
      localStorage.setItem('codeProvenance', JSON.stringify(data, (key, value) => {
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value as unknown;
      }));
    } catch (error) {
      console.error('Failed to save provenance data:', error);
    }
  }

  /**
   * Load data from localStorage
   */
  private loadStoredData(): void {
    try {
      const stored = localStorage.getItem('codeProvenance');
      if (stored) {
        const data = JSON.parse(stored);
        this.fileRecords = new Map(data.fileRecords || []);
        this.alerts = (data.alerts || []).map((alert: Record<string, unknown>) => ({
          ...alert,
          detectedAt: new Date(alert.detectedAt)
        }));
        this.monitoringEnabled = data.monitoringEnabled || false;
      }
    } catch (error) {
      console.error('Failed to load provenance data:', error);
    }
  }
}
