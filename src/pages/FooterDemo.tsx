import { Shield, Github, Twitter } from "lucide-react"
import { Footer } from "@/components/ui/footer"

const FooterDemoPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 container mx-auto px-4 pt-24">
        <div className="text-center space-y-4 py-20">
          <h1 className="text-4xl font-bold text-foreground">
            New Footer Component Demo
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Clean, minimal footer design with essential links and social media integration.
          </p>
        </div>
        
        <div className="space-y-8 mb-20">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-muted rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">Content Section {i + 1}</h2>
              <p className="text-muted-foreground">
                This is sample content to demonstrate the footer placement and styling.
                The footer appears at the bottom of the page with proper spacing and layout.
              </p>
            </div>
          ))}
        </div>
      </main>

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
  )
}

export default FooterDemoPage