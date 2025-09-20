"use client";

import { motion } from "framer-motion";
import { User, Map, BarChart } from "lucide-react";
import { AnimatedHowItWorksCard } from "../ui/animatedCard"; 

const steps = [
  {
    icon: User,
    title: "Create Your Account",
    description: "Sign up in seconds and tell us a little about your wellness goals.",
  },
  {
    icon: Map,
    title: "Get Your Personal Plan",
    description: "Receive daily exercises and mood-tracking tools tailored for you.",
  },
  {
    icon: BarChart,
    title: "Track Your Progress",
    description: "Watch your personal growth over time and celebrate your milestones.",
  },
];

export function HowItWorksSection() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
      },
    },
  };
  
  const lineVariants = {
    hidden: { pathLength: 0 },
    visible: { 
      pathLength: 1,
      transition: {
        duration: 1,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section id="how-it-works" className="w-full py-16 md:py-24 bg-muted/30 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-3 mb-16 md:mb-20">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">
            A Simple, Guided Path
          </h2>
          <p className="max-w-[600px] mx-auto text-muted-foreground md:text-lg">
            Getting started on your path to wellness is easy and intuitive.
          </p>
        </div>

        <motion.div
          className="relative grid md:grid-cols-3 gap-x-12 gap-y-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <motion.svg
            className="absolute top-12 left-0 w-full h-px hidden md:block"
            aria-hidden="true"
            preserveAspectRatio="none"
          >
            <motion.line 
              x1="0" 
              y1="0" 
              x2="100%" 
              y2="0" 
              strokeDasharray="4 4" 
              className="stroke-border" 
              strokeWidth="2"
              variants={lineVariants}
            />
          </motion.svg>
        
          {steps.map((step, index) => (
            <AnimatedHowItWorksCard
              key={index}
              stepNumber={index + 1}
              Icon={step.icon}
              title={step.title}
              description={step.description}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
