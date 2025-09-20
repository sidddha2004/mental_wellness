"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export function Header() {
  const { user, signOutUser, loading } = useAuth();
  const pathname = usePathname();

  const isAuthPage = pathname === "/auth";
  const isDashboard = pathname.startsWith("/dashboard");

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <div className="flex flex-1 items-center justify-end space-x-6">
          {!isDashboard && !isAuthPage && (
             <nav className="hidden md:flex items-center space-x-8 text-base font-medium">
                <Link href="/#features" className="text-muted-foreground transition-colors hover:text-foreground font-semibold">Features</Link>
                <Link href="/#how-it-works" className="text-muted-foreground transition-colors hover:text-foreground font-semibold">How It Works</Link>
             </nav>
          )}
          <div className="flex items-center space-x-2">
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="gap-2 mx-4">
                    <UserCircle className="h-5 w-5" />
                    <span className="hidden sm:inline">
                      {user.displayName || user.email?.split('@')[0] || 'User'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              !isAuthPage && (
                <Button asChild size="lg" className="shadow-lg mx-4" >
                  <Link href="/auth">Sign In</Link>
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
