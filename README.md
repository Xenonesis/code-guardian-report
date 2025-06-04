# 🛡️ Code Guardian Report - AI-Powered Code Analysis Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.11-38B2AC.svg)](https://tailwindcss.com/)

A comprehensive, AI-powered static code analysis platform that identifies security vulnerabilities, bugs, and code quality issues with real-time processing and intelligent insights.

![Code Guardian Dashboard](public/placeholder.svg)

## ✨ Features

### 🔍 **Comprehensive Code Analysis**
- **Security Vulnerability Detection**: Identifies injection flaws, authentication issues, and security weaknesses
- **Bug Detection**: Finds logic errors, null pointer exceptions, and runtime issues
- **Code Quality Assessment**: Detects code smells, complexity issues, and maintainability problems
- **Multi-Language Support**: Supports Python, JavaScript, TypeScript, and more

### 🤖 **AI-Powered Insights**
- **Natural Language Explanations**: Get human-readable explanations for complex issues
- **Smart Recommendations**: AI-generated solutions and best practices
- **Multiple AI Provider Support**: Compatible with OpenAI, Anthropic, and other providers
- **Contextual Analysis**: Understands your codebase context for better insights

### 📊 **Advanced Analytics Dashboard**
- **Interactive Charts**: Recharts-powered visualizations with responsive design
- **Risk Assessment**: Comprehensive security and quality metrics
- **Trend Analysis**: Historical data visualization and progress tracking
- **Performance Metrics**: Real-time monitoring and optimization insights
- **Export Capabilities**: Multiple format support (JSON, CSV, PDF, HTML, XML)

### 🎨 **Modern UI/UX**
- **Mobile-First Design**: Responsive across all devices and screen sizes
- **Dark/Light Theme**: Seamless theme switching with system preference detection
- **Accessibility Compliant**: WCAG 2.1 AA standards with screen reader support
- **Smooth Animations**: Hardware-accelerated micro-interactions and transitions
- **Glass Morphism**: Modern design with backdrop blur effects

## 🚀 Tech Stack

### **Frontend Framework**
- **React 18.3.1** - Modern component-based UI library
- **TypeScript 5.5.3** - Type-safe JavaScript with enhanced developer experience
- **Vite 5.4.1** - Lightning-fast build tool and development server

### **Styling & UI Components**
- **Tailwind CSS 3.4.11** - Utility-first CSS framework for rapid styling
- **Radix UI** - Accessible, unstyled UI components
- **shadcn/ui** - Beautiful, customizable component library
- **Lucide React** - Modern icon library with 1000+ icons

### **State Management & Data**
- **TanStack Query 5.56.2** - Powerful data synchronization for React
- **React Hook Form 7.53.0** - Performant forms with easy validation
- **Zod 3.23.8** - TypeScript-first schema validation

### **Charts & Visualization**
- **Recharts 2.15.3** - Composable charting library built on React and D3
- **Data Visualization**: Interactive pie charts, bar charts, line graphs, and area charts

### **Developer Experience**
- **ESLint 9.9.0** - Code linting and quality enforcement
- **PostCSS 8.4.47** - CSS post-processing with autoprefixer
- **TypeScript ESLint** - TypeScript-specific linting rules

### **Build & Optimization**
- **Vite React SWC Plugin** - Fast React refresh and compilation
- **Code Splitting** - Lazy loading for optimal performance
- **Bundle Optimization** - Tree shaking and dead code elimination

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** or **bun** package manager

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/Xenonesis/code-guardian-report.git
cd code-guardian-report
```

2. **Install dependencies**
```bash
# Using npm
npm install

# Using bun (recommended)
bun install
```

3. **Start development server**
```bash
# Using npm
npm run dev

# Using bun
bun dev
```

4. **Open your browser**
Navigate to `http://localhost:8080` to access the application.

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build for development
npm run preview      # Preview production build
npm run lint         # Run ESLint for code quality
```

## 📱 Usage Guide

### 1. **Upload Code Files**
- Drag and drop zip files containing your codebase
- Supports multiple programming languages
- Real-time upload progress tracking
- Automatic file validation and processing

### 2. **Configure AI Integration**
- Add API keys for your preferred AI providers (OpenAI, Anthropic, etc.)
- Secure credential storage with encryption
- Multiple provider support for redundancy
- Easy key management interface

### 3. **View Analysis Results**
- Comprehensive results table with sorting and filtering
- Interactive charts showing issue distribution
- Detailed issue descriptions with severity levels
- Export results in multiple formats

### 4. **AI-Powered Insights**
- Get natural language explanations for issues
- Receive smart recommendations and solutions
- Interactive chat interface for questions
- Contextual analysis based on your codebase

## 🎯 Supported Analysis Tools

### **Security Analysis**
- **Bandit** (Python) - Security vulnerability scanner
- **Semgrep** (Multi-language) - Static analysis for security

### **Code Quality**
- **ESLint** (JavaScript/TypeScript) - Identifies bugs and code quality issues
- **Pylint** (Python) - Comprehensive code quality checker
- **Flake8** (Python) - Style guide enforcement and convention checking

### **Additional Tools**
- Custom rule engines for specific vulnerability patterns
- Configurable severity levels and rule sets
- Integration with popular CI/CD pipelines

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# AI Provider Configuration
VITE_OPENAI_API_URL=https://api.openai.com/v1
VITE_ANTHROPIC_API_URL=https://api.anthropic.com/v1

# Application Settings
VITE_APP_NAME="Code Guardian Report"
VITE_APP_VERSION="0.10.0-beta"
```

### Customization Options
- **Theme Configuration**: Modify `tailwind.config.ts` for custom colors and styles
- **Component Customization**: Update `components.json` for shadcn/ui component paths
- **Analysis Rules**: Configure analysis tool settings in the upload form

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Popular Platforms

#### **Vercel** (Recommended)
```bash
npm install -g vercel
vercel --prod
```

#### **Netlify**
```bash
npm run build
# Upload dist/ folder to Netlify
```

#### **GitHub Pages**
```bash
npm run build
# Configure GitHub Actions for automatic deployment
```

### Performance Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components loaded on demand
- **Asset Optimization**: Images and icons optimized for web
- **Caching Strategy**: Service worker integration for offline support

## 🛡️ Security & Privacy

### **Data Protection**
- **Local Processing**: Code analysis performed client-side when possible
- **Secure Transmission**: All API communications use HTTPS
- **No Permanent Storage**: Files automatically deleted after processing
- **Privacy-First**: No tracking or analytics without consent

### **API Key Security**
- **Encrypted Storage**: API keys stored securely in browser
- **No Server Storage**: Keys never transmitted to our servers
- **Easy Management**: Add, remove, and update keys safely
- **Provider Isolation**: Each provider's keys stored separately

## 📋 Browser Support

### **Fully Supported**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### **Mobile Support**
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

### **Accessibility Features**
- **WCAG 2.1 AA Compliant**: Full accessibility standards compliance
- **Screen Reader Support**: Optimized for NVDA, JAWS, and VoiceOver
- **Keyboard Navigation**: Complete keyboard accessibility
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user motion preferences

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Run linting**: `npm run lint`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Maintain accessibility standards
- Add tests for new features
- Update documentation as needed
- Follow conventional commit messages

## 📊 Performance Metrics

### **Lighthouse Scores**
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 95+

### **Core Web Vitals**
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## 🔮 Roadmap

### **Upcoming Features**
- [ ] **Multi-language Support**: Internationalization (i18n)
- [ ] **Progressive Web App**: Offline functionality and app-like experience
- [ ] **Advanced Integrations**: GitHub, GitLab, and Bitbucket integration
- [ ] **Team Collaboration**: Shared workspaces and team management
- [ ] **Custom Rules**: User-defined analysis rules and patterns

### **Long-term Goals**
- [ ] **Voice Commands**: Voice-controlled file upload and navigation
- [ ] **Machine Learning**: Custom ML models for project-specific analysis
- [ ] **Enterprise Features**: SSO, audit logs, and compliance reporting
- [ ] **Plugin System**: Extensible architecture for third-party tools

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👤 Author

**Aditya Kumar Tiwari**
- Email: [itisaddy7@gmail.com](mailto:itisaddy7@gmail.com)
- GitHub: [@adityakumartiwari](https://github.com/adityakumartiwari)
- LinkedIn: [Aditya Kumar Tiwari](https://linkedin.com/in/adityakumartiwari)

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Vercel** - For the excellent Vite build tool
- **Tailwind Labs** - For the utility-first CSS framework
- **Radix UI** - For accessible component primitives
- **shadcn** - For the beautiful component library
- **Open Source Community** - For the incredible tools and libraries

## 📞 Support

If you encounter any issues or have questions:

1. **Check the Issues**: [GitHub Issues](https://github.com/Xenonesis/code-guardian-report/issues)
2. **Create a New Issue**: Provide detailed information about your problem
3. **Email Support**: [itisaddy7@gmail.com](mailto:itisaddy7@gmail.com)
4. **Community Discussions**: Join our community discussions

---

<div align="center">

**Made with ❤️ by [Aditya Kumar Tiwari](mailto:itisaddy7@gmail.com)**

[⭐ Star this repository](https://github.com/Xenonesis/code-guardian-report) if you find it helpful!

</div>
