import React from 'react';
import { Shield, Github, Twitter } from 'lucide-react';
import { Footer } from './footer';

/**
 * Demo component showcasing the Footer with all its features
 */
export function FooterDemo() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Code Guardian Footer Demo</h1>
          <p className="text-muted-foreground text-lg">
            Showcasing the customized footer with all functionalities
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">✨ Features</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Newsletter subscription</li>
              <li>• Theme toggle (Dark/Light)</li>
              <li>• Social media links</li>
              <li>• Contact information</li>
              <li>• Quick navigation links</li>
              <li>• Legal links</li>
            </ul>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">🎨 Customization</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Code Guardian branding</li>
              <li>• Developer social links</li>
              <li>• Project-specific contact info</li>
              <li>• Tailwind CSS styling</li>
              <li>• Responsive design</li>
              <li>• Accessibility compliant</li>
            </ul>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">🔧 Technical</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• TypeScript support</li>
              <li>• shadcn/ui components</li>
              <li>• Lucide React icons</li>
              <li>• Tooltip integration</li>
              <li>• Form handling</li>
              <li>• Theme persistence</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* The actual footer component */}
      <Footer
        logo={<Shield className="h-10 w-10 text-primary" />}
        brandName="Code Guardian"
        socialLinks={[
          {
            icon: <Github className="h-5 w-5" />,
            href: "https://github.com/Xenonesis/code-guardian-report",
            label: "GitHub",
          },
          {
            icon: <Twitter className="h-5 w-5" />,
            href: "https://twitter.com",
            label: "Twitter",
          },
        ]}
        mainLinks={[
          { href: "/", label: "Home" },
          { href: "/about", label: "About" },
          { href: "https://code-guardian-report.vercel.app", label: "Live Demo" },
          { href: "mailto:itisaddy7@gmail.com", label: "Contact" },
        ]}
        legalLinks={[
          { href: "/privacy", label: "Privacy" },
          { href: "/terms", label: "Terms" },
        ]}
        copyright={{
          text: "© 2025 Code Guardian",
          license: "All rights reserved",
        }}
      />
    </div>
  );
}

export default FooterDemo;