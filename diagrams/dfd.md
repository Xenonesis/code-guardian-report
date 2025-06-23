# Data Flow Diagram (DFD)

This diagram shows the flow of data through the Code Guardian system, from user interaction to analysis and back.

```mermaid
flowchart TD
    User([User]) -->|Uploads Code| Upload[File Upload]
    Upload -->|Processes File| Analysis[Security Analysis]
    Analysis -->|Generates Insights| AI[AIService]
    AI -->|Provides Recommendations| Insights[AI Insights Panel]
    Analysis -->|Tracks Metrics| Monitor[Real-time Monitoring]
    Monitor -->|Displays Data| Dashboard[Security Dashboard]
    Dashboard -->|Shows Results| User
    AI -->|Uses Models| OpenAI([OpenAI])
    AI -->|Uses Models| Anthropic([Anthropic])
```

## Key Components
1. **User**: Initiates the process by uploading code
2. **File Upload**: Receives and processes uploaded files
3. **Security Analysis**: Performs core security analysis
4. **AIService**: Generates insights using AI models
5. **Real-time Monitoring**: Tracks analysis metrics
6. **Security Dashboard**: Presents results to the user
7. **AI Providers**: External AI services (OpenAI, Anthropic)