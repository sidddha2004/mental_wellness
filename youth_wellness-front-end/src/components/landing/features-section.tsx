"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrainCircuit, Activity, Bot, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <BrainCircuit className="w-6 h-6 text-primary" />,
    title: "Guided Meditations",
    description: "Access a library of calming meditations for sleep, stress, and focus.",
  },
  {
    icon: <Activity className="w-6 h-6 text-primary" />,
    title: "Mood Journaling",
    description: "Track your emotions and gain insights into your mental patterns.",
  },
  {
    icon: <Bot className="w-6 h-6 text-primary" />,
    title: "Personalized Insights",
    description: "Receive gentle, AI-powered feedback to understand your triggers and strengths.",
  },
  {
    icon: <BookOpen className="w-6 h-6 text-primary" />,
    title: "Expert Resources",
    description: "Read articles and watch videos from licensed wellness professionals.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="w-full py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <motion.div 
          className="text-center space-y-3 mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={itemVariants}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">
            Tools for Your Wellness Toolkit
          </h2>
          <p className="max-w-[600px] mx-auto text-muted-foreground md:text-lg">
            Everything you need to support your mental wellness journey.
          </p>
        </motion.div>
        <motion.div 
          className="mx-auto grid max-w-5xl items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="shadow-md hover:shadow-xl transition-shadow duration-300 h-full">
                <CardHeader className="flex flex-row items-center gap-4 p-4 md:p-6">
                  <div className="rounded-full bg-primary/10 p-3">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg md:text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
