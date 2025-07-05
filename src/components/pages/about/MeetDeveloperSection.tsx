import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ExternalLink, 
  Trophy, 
  Code, 
  Shield, 
  Crown,
  User,
  Zap,
  Star,
  Globe
} from 'lucide-react';

const MeetDeveloperSection = () => {
  const teamMembers = [
    {
      name: "Aditya Kumar Tiwari",
      role: "Team Leader & Security Expert",
      icon: <Crown className="w-5 h-5" />,
      description: "Cybersecurity expert and lead developer specializing in security architecture and vulnerability analysis",
      expertise: ["Team Leadership", "Cybersecurity", "Penetration Testing", "Security Architecture", "Vulnerability Assessment", "Project Management"]
    },
    {
      name: "Mohammad Ehshan",
      role: "Backend Developer",
      icon: <Code className="w-5 h-5" />,
      description: "Backend development specialist focused on API design and server-side architecture",
      expertise: ["Backend Development", "API Development", "Database Design", "Server Architecture", "Node.js", "System Integration"]
    },
    {
      name: "Vishupal Goyal",
      role: "Frontend Developer",
      icon: <User className="w-5 h-5" />,
      description: "Frontend development and user experience design specialist",
      expertise: ["Frontend Development", "UI/UX Design", "React Development", "User Experience", "Responsive Design", "Component Architecture"]
    },
    {
      name: "Aayush Tonk",
      role: "Full-Stack Developer",
      icon: <Zap className="w-5 h-5" />,
      description: "Full-stack development and system architecture specialist",
      expertise: ["Full-Stack Development", "System Design", "DevOps", "Database Management", "Performance Optimization", "Technical Documentation"]
    },
    {
      name: "Muneer Ali",
      role: "Developer",
      icon: <Star className="w-5 h-5" />,
      description: "Developer contributing to various aspects of the project",
      expertise: ["Software Development", "Code Review", "Testing", "Documentation", "Collaboration"]
    }
  ];

  const projectHighlights = [
    {
      icon: <Trophy className="w-5 h-5" />,
      title: "Latest v3.3.0 Release",
      description: "Enhanced with persistent storage and advanced analytics"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "AI-Powered Innovation",
      description: "Advanced GPT-4 & Claude integration with intelligent key management"
    },
    {
      icon: <Star className="w-5 h-5" />,
      title: "Developer-Centric",
      description: "Persistent results with cross-tab synchronization and export capabilities"
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Production Ready",
      description: "Enterprise-grade security analysis with comprehensive reporting"
    }
  ];

  const technologies = [
    "React 18.3.1", "TypeScript 5.5.3", "Vite 6.3.5", "Tailwind CSS 3.4.11", 
    "AI Services (GPT-4, Claude)", "Recharts 2.15.3", "Radix UI", "shadcn/ui",
    "Node.js", "Static Analysis Tools", "Security Frameworks", "Persistent Storage API",
    "Web Crypto API", "IndexedDB", "Service Workers", "Bundle Analysis"
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Meet the Development Team
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-6">
              Code Guardian is proudly developed by Team Blitz - a passionate group of developers and security experts 
              committed to making code security accessible to everyone.
            </p>
            
            {/* Team Blitz Card */}
            <Card className="max-w-2xl mx-auto mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <CardHeader>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Users className="w-6 h-6" />
                  <CardTitle className="text-2xl">Team Blitz</CardTitle>
                </div>
                <CardDescription className="text-blue-100">
                  Innovative development team focused on AI-powered security solutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button 
                    variant="secondary" 
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={() => window.open('https://teamblitz.netlify.app/', '_blank')}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Team Website
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    Hackathon Winners
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {projectHighlights.map((highlight, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                      {highlight.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {highlight.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {highlight.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Team Members */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
              Our Team Members
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamMembers.map((member, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
                        {member.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <CardDescription className="text-blue-600 dark:text-blue-400 font-medium">
                          {member.role}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {member.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Project Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Project Details
              </CardTitle>            <CardDescription>
              Code Guardian v3.3.0 - Revolutionary AI-powered security analysis platform with persistent storage, enhanced analytics, and intelligent AI integration
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* USP */}
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                  🚀 Unique Selling Proposition (USP)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Persistent Intelligence</h5>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Advanced storage system with cross-tab sync and intelligent history management for continuous analysis
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">Enhanced AI Integration</h5>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Advanced AI key management with GPT-4 and Claude integration for superior vulnerability detection
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <h5 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Performance Analytics</h5>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      Comprehensive bundle monitoring and performance tracking with real-time analytics dashboard
                    </p>
                  </div>
                </div>
              </div>

              {/* Technologies */}
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                  🛠️ Technologies Used
                </h4>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Impact */}
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                  💡 Why It Matters
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-slate-900 dark:text-white">Persistent Security</h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Continuous analysis with persistent results that maintain security insights across sessions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-slate-900 dark:text-white">Enhanced Productivity</h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Advanced storage and analytics reduce analysis time while improving code quality insights
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-slate-900 dark:text-white">Enterprise Features</h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Production-ready with comprehensive reporting, export capabilities, and performance monitoring
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Join Our Mission</h3>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Help us make code security accessible to developers worldwide. 
                  Visit our team website to learn more about our projects and initiatives.
                </p>
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  onClick={() => window.open('https://teamblitz.netlify.app/', '_blank')}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Visit Team Blitz
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetDeveloperSection;
