# UML Class Diagram

This diagram represents the core classes and their relationships in the Code Guardian system.

```mermaid
classDiagram
    class AnalysisTracker {
        +trackAnalysis()
        +logResults()
    }
    class MetricsCalculator {
        +calculateMetrics()
        +generateReports()
    }
    class SecurityAnalyzer {
        +analyzeCode()
        +detectVulnerabilities()
    }
    class AIService {
        +generateInsights()
        +provideRecommendations()
    }
    class EnhancedAnalysisEngine {
        +performAdvancedAnalysis()
        +evaluateSecurity()
    }
    
    AnalysisTracker --> MetricsCalculator : uses
    SecurityAnalyzer --> AnalysisTracker : updates
    SecurityAnalyzer --> AIService : requests insights
    AIService --> EnhancedAnalysisEngine : leverages
```

## Key Classes
1. **AnalysisTracker**: Tracks analysis progress and logs results
2. **MetricsCalculator**: Calculates various security metrics and generates reports
3. **SecurityAnalyzer**: Performs code analysis and detects vulnerabilities
4. **AIService**: Provides AI-powered insights and recommendations
5. **EnhancedAnalysisEngine**: Handles advanced security analysis and evaluation