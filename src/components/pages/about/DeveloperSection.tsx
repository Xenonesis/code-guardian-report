import React from 'react';
import { Users, Star, Award, Github } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DeveloperSectionProps {
  className?: string;
}

export const DeveloperSection: React.FC<DeveloperSectionProps> = ({ className = '' }) => {
  const skills = [
    'Digital Forensics', 
    'Python', 
    'JavaScript', 
    'Linux', 
    'Cybersecurity', 
    'Cloud Computing', 
    'Web Development'
  ];

  const socialLinks = [
    {
      href: 'https://github.com/Xenonesis',
      icon: <Github className="h-4 w-4" />,
      label: 'GitHub',
      hoverColor: 'blue'
    },
    {
      href: 'https://www.linkedin.com/in/itisaddy/',
      icon: <Users className="h-4 w-4" />,
      label: 'LinkedIn',
      hoverColor: 'blue'
    },
    {
      href: 'https://iaddy.netlify.app/',
      icon: <Star className="h-4 w-4" />,
      label: 'Portfolio',
      hoverColor: 'purple'
    },
    {
      href: 'mailto:itisaddy7@gmail.com',
      icon: <Award className="h-4 w-4" />,
      label: 'Contact',
      hoverColor: 'green'
    }
  ];

  const getHoverClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'hover:bg-blue-100 dark:hover:bg-blue-900 group-hover:text-blue-600 dark:group-hover:text-blue-400';
      case 'purple':
        return 'hover:bg-purple-100 dark:hover:bg-purple-900 group-hover:text-purple-600 dark:group-hover:text-purple-400';
      case 'green':
        return 'hover:bg-green-100 dark:hover:bg-green-900 group-hover:text-green-600 dark:group-hover:text-green-400';
      default:
        return 'hover:bg-blue-100 dark:hover:bg-blue-900 group-hover:text-blue-600 dark:group-hover:text-blue-400';
    }
  };

  return (
    <section className={`py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 ${className}`} aria-labelledby="developer-title">
      <div className="text-center mb-8 sm:mb-12 lg:mb-16 px-4 sm:px-0">
        <h3 id="developer-title" className="text-responsive-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
          Meet the Developer
        </h3>
        <p className="text-responsive-base text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          Built with passion by a cybersecurity enthusiast and full-stack developer
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="modern-card hover-float-strong group cursor-pointer overflow-hidden">
          <CardContent className="p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Profile Image/Avatar */}
              <div className="text-center lg:text-left">
                <div className="w-32 h-32 mx-auto lg:mx-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  AT
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Aditya Kumar Tiwari</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Cybersecurity Enthusiast | Full-Stack Developer</p>
                  <p className="text-slate-500 dark:text-slate-500 text-xs">BCA in Cybersecurity, Sushant University</p>
                </div>
              </div>

              {/* Bio */}
              <div className="lg:col-span-2 space-y-4">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Hi, I'm Aditya Kumar Tiwari, a passionate Cybersecurity Specialist and Full-Stack Developer.
                  I thrive at the intersection of technology and innovation, crafting secure and scalable solutions
                  for real-world challenges.
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Currently pursuing a BCA in Cybersecurity at Sushant University, I specialize in Python, JavaScript,
                  Linux, and Cloud Computing. My mission is to combine security and creativity to build impactful
                  digital experiences.
                </p>

                {/* Skills */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-slate-900 dark:text-white">Core Expertise</h5>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="hover-float-subtle cursor-pointer">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap gap-4 pt-4">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors group ${getHoverClasses(link.hoverColor)}`}
                    >
                      <span className="text-slate-600 dark:text-slate-400 group-hover:text-inherit transition-colors">
                        {link.icon}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-inherit transition-colors">
                        {link.label}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
