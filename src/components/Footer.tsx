import Link from 'next/link'

export function Footer() {
  return (
    <footer className="py-12 sm:py-16 bg-muted border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid gap-8 md:gap-12 md:grid-cols-2 lg:grid-cols-4 mb-8">
          
          {/* Brand Column */}
          <div>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              NoFears.app
            </div>
            <p className="text-base leading-relaxed text-muted-foreground">
              Transform your rock bottom into your comeback story with AI-powered life rebuilding.
            </p>
          </div>
          
          {/* Product Column */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Product</h4>
            <div className="space-y-2">
              <Link href="#features" className="block text-base text-muted-foreground hover:text-foreground transition-colors">
                Life Assessment
              </Link>
              <Link href="#features" className="block text-base text-muted-foreground hover:text-foreground transition-colors">
                AI Tasks
              </Link>
              <Link href="#features" className="block text-base text-muted-foreground hover:text-foreground transition-colors">
                Progress Tracking
              </Link>
              <Link href="#pricing" className="block text-base text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
            </div>
          </div>
          
          {/* Support Column */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Support</h4>
            <div className="space-y-2">
              <Link href="#faq" className="block text-base text-muted-foreground hover:text-foreground transition-colors">
                Help Center
              </Link>
              <Link href="/contact" className="block text-base text-muted-foreground hover:text-foreground transition-colors">
                Contact Us
              </Link>
              <Link href="/privacy" className="block text-base text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-base text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          
          {/* Connect Column */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Connect</h4>
            <div className="space-y-2">
              <a href="#" className="block text-base text-muted-foreground hover:text-foreground transition-colors">
                Twitter
              </a>
              <a href="#" className="block text-base text-muted-foreground hover:text-foreground transition-colors">
                LinkedIn
              </a>
              <a href="#" className="block text-base text-muted-foreground hover:text-foreground transition-colors">
                Instagram
              </a>
              <a href="#" className="block text-base text-muted-foreground hover:text-foreground transition-colors">
                YouTube
              </a>
            </div>
          </div>
          
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-border pt-8 text-center">
          <p className="text-base text-muted-foreground">
            &copy; 2024 NoFears.app. All rights reserved. Made with ❤️ for people ready to rebuild.
          </p>
        </div>
        
      </div>
    </footer>
  )
} 