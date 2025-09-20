"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Loader2, Send, Sparkles, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mic } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/auth-context"; 


const chatSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty." }),
});

type Message = {
  text: string;
  sender: "user" | "ai";
};

const moodPrompts = [
    { mood: "😊", label: "Happy" },
    { mood: "😔", label: "Sad" },
    { mood: "😡", label: "Angry" },
    { mood: "😨", label: "Anxious" }
]



export function ChatbotSection() {
  const { user } = useAuth(); // 2. GET the current user from your auth context
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: { message: "" },
  });
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;
  
    if (!user) {
      const errorMessage: Message = {
        text: "You must be logged in to chat. Please refresh the page.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }
  
    setIsLoading(true);
    const userMessage: Message = { text: messageText, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    form.reset();
  
    try {
      const token = await user.getIdToken();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      const response = await fetch(`${backendUrl}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        // Body updated to only send the message, as userId comes from the token
        body: JSON.stringify({ 
          message: messageText,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
  
      const result = await response.json();
      console.log("Backend response received:", result); // Good for debugging
      
      // ✅ THE FIX: Access the nested response text correctly
      const aiMessage: Message = { text: result.response, sender: "ai" };
  
      setMessages((prev) => [...prev, aiMessage]);
  
    } catch (e) {
      const errorMessage: Message = {
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  const onSubmit = (values: z.infer<typeof chatSchema>) => {
    handleSendMessage(values.message);
  };
  
  const onMoodClick = (mood: string) => {
    handleSendMessage(`I'm feeling ${mood.toLowerCase()} today.`);
  }

  return (
    <Card className="shadow-xl flex flex-col h-[75vh] max-h-[800px] border-primary/20 bg-background">
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex items-center gap-3">
            <Sparkles className="text-primary w-8 h-8" />
            <div>
                <h2 className="text-xl font-bold tracking-tight">Your AI Companion</h2>
                <p className="text-sm text-muted-foreground">A safe and private space to share your thoughts.</p>
            </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Panic Button
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Need Immediate Help?</AlertDialogTitle>
              <AlertDialogDescription>
                If you are in a crisis or any other person may be in danger, please don't use this app. These resources can provide you with immediate help.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 text-sm">
                <p><strong>AASRA:</strong> <a href="tel:91-9820466726" className="text-primary hover:underline">91-9820466726</a> (24x7 Helpline)</p>
                <p><strong>Vandrevala Foundation:</strong> <a href="tel:91-9999666555" className="text-primary hover:underline">91-9999666555</a> (24x7 Helpline)</p>
                <p><strong>iCALL:</strong> <a href="tel:91-9152987821" className="text-primary hover:underline">91-9152987821</a> (Mon-Sat, 10 AM - 8 PM)</p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <AlertDialogAction asChild><a href="tel:91-9820466726">Call Now</a></AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden p-4 md:p-6">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-muted-foreground pt-16 flex flex-col items-center gap-4">
                <p className="text-lg">How are you feeling today?</p>
                <div className="flex gap-2 md:gap-4">
                    {moodPrompts.map(p => (
                        <Button key={p.label} variant="outline" className="rounded-full h-16 w-16 md:h-20 md:w-20 flex-col gap-1 text-2xl" onClick={() => onMoodClick(p.label)}>
                            <span>{p.mood}</span>
                            <span className="text-xs font-normal">{p.label}</span>
                        </Button>
                    ))}
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.sender === "user" ? "justify-end" : ""
                }`}
              >
                {message.sender === "ai" && (
                  <Avatar className="h-9 w-9 border-2 border-primary/50 shadow-inner">
                    <AvatarFallback className="bg-primary/20 text-primary">
                        <Sparkles className="w-5 h-5"/>
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-2xl p-3 max-w-sm md:max-w-md shadow-md transition-all duration-300 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-card border rounded-bl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex items-start gap-3">
                 <Avatar className="h-9 w-9 border-2 border-primary/50 shadow-inner">
                   <AvatarFallback className="bg-primary/20 text-primary">
                        <Sparkles className="w-5 h-5"/>
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl p-4 bg-card border shadow-md flex items-center rounded-bl-none animate-pulse">
                    <Loader2 className="h-5 w-5 animate-spin text-primary"/>
                  </div>
               </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 border-t bg-background/50">
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2 w-full">
      <FormField
        control={form.control}
        name="message"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input 
                placeholder="Share what's on your mind..." 
                {...field} 
                autoComplete="off" 
                className="text-base h-11 rounded-full px-5" 
              />
            </FormControl>
          </FormItem>
        )}
      />
      {/* 🎤 Microphone button */}
      <Button 
        type="button" 
        size="icon" 
        variant="outline" 
        className="w-11 h-11 rounded-full"
        onClick={() => console.log("Mic clicked")}
      >
        <Mic className="h-5 w-5" />
      </Button>
      <Button type="submit" size="icon" disabled={isLoading} className="w-11 h-11 rounded-full">
        <Send className="h-5 w-5" />
      </Button>
    </form>
  </Form>
</CardFooter>
    </Card>
  );
}