"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Facebook, 
  Instagram, 
  Linkedin, 
  Moon, 
  Send, 
  Sun, 
  Twitter,
  Shield,
  Github,
  Mail,
  MapPin,
  Phone
} from "lucide-react"

interface FooterProps {
  logo?: React.ReactNode
  brandName?: string
  description?: string
  socialLinks?: Array<{
    icon: React.ReactNode
    href: string
    label: string
  }>
  mainLinks?: Array<{
    href: string
    label: string
  }>
  legalLinks?: Array<{
    href: string
    label: string
  }>
  copyright?: {
    text: string
    license?: string
  }
  contactInfo?: {
    address: string[]
    phone: string
    email: string
  }
  showNewsletter?: boolean
  showThemeToggle?: boolean
}

export function Footer({
  logo = <Shield className="h-10 w-10 text-primary" />,
  brandName = "Code Guardian",
  description = "Stay updated with the latest security insights and AI-powered code analysis features.",
  socialLinks = [
    {
      icon: <Github className="h-5 w-5" />,
      href: "https://github.com/Xenonesis/code-guardian-report",
      label: "GitHub",
    },
    {
      icon: <Linkedin className="h-5 w-5" />,
      href: "https://linkedin.com/in/itisaddy",
      label: "LinkedIn",
    },
    {
      icon: <Twitter className="h-4 w-4" />,
      href: "https://twitter.com",
      label: "Twitter",
    },
    {
      icon: <Instagram className="h-4 w-4" />,
      href: "https://instagram.com/i__aditya7",
      label: "Instagram",
    },
    {
      icon: <Facebook className="h-4 w-4" />,
      href: "https://facebook.com",
      label: "Facebook",
    },
  ],
  mainLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "https://code-guardian-report.vercel.app", label: "Live Demo" },
    { href: "https://github.com/Xenonesis/code-guardian-report/issues", label: "Support" },
    { href: "mailto:itisaddy7@gmail.com", label: "Contact" },
  ],
  legalLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Settings" },
  ],
  copyright = {
    text: "© 2025 Code Guardian v2.6.0",
    license: "Developed by Aditya Kumar Tiwari - MIT License",
  },
  contactInfo = {
    address: ["Sushant University", "Gurgaon, India"],
    phone: "Available on LinkedIn",
    email: "itisaddy7@gmail.com",
  },
  showNewsletter = true,
  showThemeToggle = true,
}: FooterProps) {
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return true
  })

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300 pb-6 pt-16 lg:pb-8 lg:pt-24">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="md:flex md:items-start md:justify-between mb-12">
          <a
            href="/"
            className="flex items-center gap-x-2"
            aria-label={brandName}
          >
            {logo}
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {brandName}
            </span>
          </a>
          <ul className="flex list-none mt-6 md:mt-0 space-x-3">
            {socialLinks.slice(0, 2).map((link, i) => (
              <li key={i}>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:scale-105 transition-transform"
                  asChild
                >
                  <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                    {link.icon}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {showNewsletter && (
            <div className="relative">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">Stay Connected</h2>
              <p className="mb-6 text-muted-foreground">
                {description}
              </p>
              <form className="relative">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="pr-12 backdrop-blur-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Subscribe</span>
                </Button>
              </form>
              <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
            </div>
          )}

          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <nav className="space-y-2 text-sm">
              {mainLinks.map((link, i) => (
                <a 
                  key={i}
                  href={link.href} 
                  className="block transition-colors hover:text-primary"
                  target={link.href.startsWith('http') ? '_blank' : '_self'}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Info</h3>
            <address className="space-y-3 text-sm not-italic">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  {contactInfo.address.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p>{contactInfo.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${contactInfo.email}`} className="hover:text-primary transition-colors">
                  {contactInfo.email}
                </a>
              </div>
            </address>
          </div>

          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>
            <div className="mb-6 flex flex-wrap gap-4">
              <TooltipProvider>
                {socialLinks.slice(2).map((link, i) => (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full hover:scale-105 transition-transform"
                        asChild
                      >
                        <a href={link.href} target="_blank" rel="noopener noreferrer">
                          {link.icon}
                          <span className="sr-only">{link.label}</span>
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Follow us on {link.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
            {showThemeToggle && (
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <Switch
                  id="dark-mode"
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                />
                <Moon className="h-4 w-4" />
                <Label htmlFor="dark-mode" className="sr-only">
                  Toggle dark mode
                </Label>
              </div>
            )}
          </div>
        </div>

        <div className="border-t mt-6 pt-6 md:mt-4 md:pt-8 lg:grid lg:grid-cols-10">
          <nav className="lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-3 lg:justify-end">
              {legalLinks.map((link, i) => (
                <li key={i} className="my-1 mx-3 shrink-0">
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-6 text-sm leading-6 text-muted-foreground whitespace-nowrap lg:mt-0 lg:row-[1/3] lg:col-[1/4]">
            <div className="font-semibold">{copyright.text}</div>
            {copyright.license && <div className="mt-1">{copyright.license}</div>}
          </div>
        </div>
      </div>
    </footer>
  )
}