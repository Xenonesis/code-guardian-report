import { ModernNavbar } from "@/components/ui/modern-navbar"
import { Home, User, Briefcase, FileText, Settings, Shield } from "lucide-react"

const NavbarDemoPage = () => {
  const navItems = [
    { name: "Home", url: "/", icon: Home },
    { name: "About", url: "/about", icon: User },
    { name: "Security", url: "#security", icon: Shield },
    { name: "Reports", url: "#reports", icon: FileText },
    { name: "Settings", url: "#settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background">
      <ModernNavbar items={navItems} defaultActive="Home" />
      
      <main className="container mx-auto px-4 pt-24">
        <div className="text-center space-y-4 py-20">
          <h1 className="text-4xl font-bold text-foreground">
            Code Guardian - Modern Navbar Demo
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the sleek navigation with smooth animations and responsive design. 
            Scroll down to see the navbar collapse, then scroll up to expand it again.
          </p>
        </div>
        
        <div className="space-y-8">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-muted rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">Section {i + 1}</h2>
              <p className="text-muted-foreground">
                This demonstrates the scroll behavior of the navbar. 
                The navbar automatically collapses when scrolling down and expands when scrolling up.
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default NavbarDemoPage