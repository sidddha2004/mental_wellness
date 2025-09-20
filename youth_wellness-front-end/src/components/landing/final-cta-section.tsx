import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl/tight font-headline">
            Ready to Begin?
          </h2>
          <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed">
            Your path to a healthier mind is one click away. Join a supportive space designed just for you.
          </p>
        </div>
        <div className="mx-auto w-full max-w-sm space-y-2 mt-4">
          {/* Changed button style for better contrast */}
          <Button asChild size="lg" className="shadow-lg bg-background text-primary hover:bg-background/90">
            <Link href="/auth">Start Your Journey for Free</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}