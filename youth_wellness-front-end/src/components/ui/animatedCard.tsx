"use client";

import { motion } from "framer-motion";
import type { LucideProps } from "lucide-react";
import React from "react";

interface CardProps {
  stepNumber: number;
  Icon: React.ElementType<LucideProps>;
  title: string;
  description: string;
}

export function AnimatedHowItWorksCard({ stepNumber, Icon, title, description }: CardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 }, // Start invisible and 50px down
    visible: { 
      opacity: 1, 
      y: 0, // Animate to visible and original position
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div 
      className="relative bg-background p-6 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300"
      variants={cardVariants}
    >
      <div className="absolute -top-4 -left-4 text-8xl font-bold text-primary/20 select-none" aria-hidden="true">
        {stepNumber.toString().padStart(2, '0')}
      </div>
      <div className="flex flex-col items-center text-center">
        <div className="mb-5 bg-primary/10 p-4 rounded-full">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </motion.div>
  );
}