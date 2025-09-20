import Image from "next/image";

export function WhySection() {
    return (
        <section className="w-full py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight font-headline">
                Because Your Mental Health Matters
              </h2>
              <p className="text-muted-foreground text-lg">
                In today's fast-paced world, taking a moment for yourself is
                more important than ever. Zenith was born from a desire to
                provide a compassionate, accessible companion for your mental
                wellness journey. We believe in the power of small, consistent
                steps to create lasting positive change. Our mission is to
                empower you with tools that are not just effective, but also
                feel like a friend.
              </p>
            </div>
            <Image
              src="https://picsum.photos/seed/people/600/400"
              width="600"
              height="400"
              alt="Supportive friends"
              data-ai-hint="people support"
              className="mx-auto rounded-xl object-cover shadow-lg"
            />
          </div>
        </div>
      </section>
    )
}
