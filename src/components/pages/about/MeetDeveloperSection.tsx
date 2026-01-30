import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Globe,
  Rocket,
  Wrench,
  Lightbulb,
} from "lucide-react";

const MeetDeveloperSection = () => {
  const teamMembers = [
    {
      name: "Aditya Kumar Tiwari",
      role: "Team Leader & Security Expert",
      icon: <Crown className="h-5 w-5" />,
      description:
        "Cybersecurity expert and lead developer specializing in security architecture and vulnerability analysis",
      expertise: [
        "Team Leadership",
        "Cybersecurity",
        "Penetration Testing",
        "Security Architecture",
        "Vulnerability Assessment",
        "Project Management",
      ],
    },
    {
      name: "Mohammad Ehshan",
      role: "Backend Developer",
      icon: <Code className="h-5 w-5" />,
      description:
        "Backend development specialist focused on API design and server-side architecture",
      expertise: [
        "Backend Development",
        "API Development",
        "Database Design",
        "Server Architecture",
        "Node.js",
        "System Integration",
      ],
    },
    {
      name: "Vishupal Goyal",
      role: "Frontend Developer",
      icon: <User className="h-5 w-5" />,
      description: "Frontend development and user experience design specialist",
      expertise: [
        "Frontend Development",
        "UI/UX Design",
        "React Development",
        "User Experience",
        "Responsive Design",
        "Component Architecture",
      ],
    },
    {
      name: "Aayush Tonk",
      role: "Full-Stack Developer",
      icon: <Zap className="h-5 w-5" />,
      description: "Full-stack development and system architecture specialist",
      expertise: [
        "Full-Stack Development",
        "System Design",
        "DevOps",
        "Database Management",
        "Performance Optimization",
        "Technical Documentation",
      ],
    },
    {
      name: "Muneer Ali",
      role: "Developer",
      icon: <Star className="h-5 w-5" />,
      description: "Developer contributing to various aspects of the project",
      expertise: [
        "Software Development",
        "Code Review",
        "Testing",
        "Documentation",
        "Collaboration",
      ],
    },
  ];

  const projectHighlights = [
    {
      icon: <Trophy className="h-5 w-5" />,
      title: "Latest v3.3.0 Release",
      description: "Enhanced with persistent storage and advanced analytics",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "AI-Powered Innovation",
      description:
        "Advanced GPT-4 & Claude integration with intelligent key management",
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Developer-Centric",
      description:
        "Persistent results with cross-tab synchronization and export capabilities",
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Production Ready",
      description:
        "Enterprise-grade security analysis with comprehensive reporting",
    },
  ];

  const technologies = [
    "React 19.x",
    "TypeScript 5.x",
    "Next.js 15.x",
    "Tailwind CSS 4.x",
    "AI Services (GPT-4, Claude)",
    "Recharts 3.x",
    "Radix UI",
    "shadcn/ui",
    "Node.js",
    "Static Analysis Tools",
    "Security Frameworks",
    "Persistent Storage API",
    "Web Crypto API",
    "IndexedDB",
    "Service Workers",
    "Bundle Analysis",
  ];

  return (
    <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-16 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl">
              Meet the Development Team
            </h2>
            <p className="mx-auto mb-6 max-w-3xl text-lg text-slate-600 dark:text-slate-400">
              Code Guardian is proudly developed by Team Blitz - a passionate
              group of developers and security experts committed to making code
              security accessible to everyone.
            </p>

            {/* Team Blitz Card */}
            <Card className="mx-auto mb-8 max-w-2xl border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardHeader>
                <div className="mb-2 flex items-center justify-center gap-3">
                  <Users className="h-6 w-6" />
                  <CardTitle className="text-2xl">Team Blitz</CardTitle>
                </div>
                <CardDescription className="text-blue-100">
                  Innovative development team focused on AI-powered security
                  solutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button
                    variant="secondary"
                    className="border-primary/30 bg-primary/20 text-primary-foreground hover:bg-primary/30"
                    onClick={() =>
                      window.open("https://teamblitz.netlify.app/", "_blank")
                    }
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Visit Team Website
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  <Badge
                    variant="secondary"
                    className="bg-primary/20 text-primary-foreground"
                  >
                    Hackathon Winners
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Highlights */}
          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {projectHighlights.map((highlight, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="mb-3 flex justify-center">
                    <div className="rounded-lg bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      {highlight.icon}
                    </div>
                  </div>
                  <h3 className="text-foreground mb-2 font-semibold">
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
            <h3 className="text-foreground mb-8 text-center text-2xl font-bold">
              Our Team Members
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {teamMembers
                .filter((member) => member.name === "Aditya Kumar Tiwari")
                .map((member, index) => (
                  <Card
                    key={index}
                    className="transition-shadow hover:shadow-lg"
                  >
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-3 text-white">
                          {member.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {member.name}
                          </CardTitle>
                          <CardDescription className="font-medium text-blue-600 dark:text-blue-400">
                            {member.role}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-slate-600 dark:text-slate-400">
                        {member.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {member.expertise.map((skill, skillIndex) => (
                          <Badge
                            key={skillIndex}
                            variant="outline"
                            className="text-xs"
                          >
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
                <Code className="h-5 w-5" />
                Project Details
              </CardTitle>{" "}
              <CardDescription>
                Code Guardian v3.3.0 - Revolutionary AI-powered security
                analysis platform with persistent storage, enhanced analytics,
                and intelligent AI integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* USP */}
              <div>
                <h4 className="text-foreground mb-3 flex items-center gap-2 font-semibold">
                  <Rocket className="h-4 w-4 text-indigo-600" />
                  Unique Selling Proposition (USP)
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
                    <h5 className="mb-2 font-medium text-blue-900 dark:text-blue-100">
                      Persistent Intelligence
                    </h5>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Advanced storage system with cross-tab sync and
                      intelligent history management for continuous analysis
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
                    <h5 className="mb-2 font-medium text-green-900 dark:text-green-100">
                      Enhanced AI Integration
                    </h5>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Advanced AI key management with GPT-4 and Claude
                      integration for superior vulnerability detection
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-950/30">
                    <h5 className="mb-2 font-medium text-purple-900 dark:text-purple-100">
                      Performance Analytics
                    </h5>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      Comprehensive bundle monitoring and performance tracking
                      with real-time analytics dashboard
                    </p>
                  </div>
                </div>
              </div>

              {/* Technologies */}
              <div>
                <h4 className="text-foreground mb-3 flex items-center gap-2 font-semibold">
                  <Wrench className="h-4 w-4 text-slate-600" />
                  Technologies Used
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
                <h4 className="text-foreground mb-3 flex items-center gap-2 font-semibold">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Why It Matters
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-5 w-5 text-red-500" />
                    <div>
                      <h5 className="text-foreground font-medium">
                        Persistent Security
                      </h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Continuous analysis with persistent results that
                        maintain security insights across sessions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="mt-0.5 h-5 w-5 text-yellow-500" />
                    <div>
                      <h5 className="text-foreground font-medium">
                        Enhanced Productivity
                      </h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Advanced storage and analytics reduce analysis time
                        while improving code quality insights
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="mt-0.5 h-5 w-5 text-blue-500" />
                    <div>
                      <h5 className="text-foreground font-medium">
                        Enterprise Features
                      </h5>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Production-ready with comprehensive reporting, export
                        capabilities, and performance monitoring
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8">
                <h3 className="mb-4 text-2xl font-bold">Join Our Mission</h3>
                <p className="mx-auto mb-6 max-w-2xl text-blue-100">
                  Help us make code security accessible to developers worldwide.
                  Visit our team website to learn more about our projects and
                  initiatives.
                </p>
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-background text-blue-600 hover:bg-blue-50"
                  onClick={() =>
                    window.open("https://teamblitz.netlify.app/", "_blank")
                  }
                >
                  <Users className="mr-2 h-5 w-5" />
                  Visit Team Blitz
                  <ExternalLink className="ml-2 h-4 w-4" />
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
