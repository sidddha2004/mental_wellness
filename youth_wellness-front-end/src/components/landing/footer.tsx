import Link from "next/link";
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button"; 
import { Twitter, Instagram, Linkedin } from "lucide-react"; 
import { Logo } from "../logo";

export function Footer() {
  return (
    <footer className="w-full bg-muted/30 pt-12 md:pt-16">
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          
          <div className="flex flex-col items-start gap-2">
            <Logo />
            <p className="text-sm text-muted-foreground mt-2">
              Your compassionate companion on the journey to mental wellness and inner peace.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3">
            <h4 className="font-semibold tracking-wide">Explore</h4>
            <Link href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">How It Works</Link>
            <Link href="/#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link>
          </div>

          <div className="flex flex-col items-start gap-3">
            <h4 className="font-semibold tracking-wide">Connect</h4>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></Link>
            </div>
          </div>
          
          <div className="flex flex-col items-start gap-3">
            <h4 className="font-semibold tracking-wide">Stay Updated</h4>
            <p className="text-sm text-muted-foreground">Get wellness tips and updates delivered to your inbox.</p>
            <form className="flex w-full max-w-sm space-x-2">
              <Input type="email" placeholder="Email" className="flex-1" />
              <Button type="submit" variant="secondary">Subscribe</Button>
            </form>
          </div>

        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            &copy; {new Date().getFullYear()} Zenith. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground">Terms of Service</Link>
            <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground">Privacy Policy</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
