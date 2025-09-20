
"use client";

import { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BookCheck, Star, Loader2, Sparkles, Wand2, Share2 } from "lucide-react";
import { addDays, format } from 'date-fns';
import { useAuth } from "@/contexts/auth-context";
import { generateAffirmation } from "@/ai/flows/affirmation-generation";
import { useToast } from "@/hooks/use-toast";

// This can be the type for a single entry
type JournalEntry = {
  mood: number;
  entry: string;
};

// This will be the structure for your journal data
type JournalData = {
  [date: string]: JournalEntry;
};

const chartConfig = {
  mood: {
    label: "Mood (1-10)",
    color: "hsl(var(--primary))",
  },
};

export function DailyDiarySection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [journalData, setJournalData] = useState<JournalData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [affirmation, setAffirmation] = useState<string | null>(null);

  useEffect(() => {
    const fetchJournalEntries = async () => {
      if (!user) return;
      setIsLoading(true);
      // Mock fetching data
      setTimeout(() => {
        setJournalData({
            [format(new Date(), 'yyyy-MM-dd')]: { mood: 7, entry: "Feeling pretty good today. Productive day at work." },
            [format(addDays(new Date(), -1), 'yyyy-MM-dd')]: { mood: 5, entry: "A bit stressed about the upcoming deadline." },
            [format(addDays(new Date(), -3), 'yyyy-MM-dd')]: { mood: 8, entry: "Had a great time with friends." },
        });
        setIsLoading(false);
      }, 1000);
    };
    fetchJournalEntries();
  }, [user]);

  const todayStr = date ? format(date, "yyyy-MM-dd") : "";
  const currentEntry = journalData[todayStr];

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(new Date(), i - 6);
    const dayStr = format(day, "yyyy-MM-dd");
    const entry = journalData[dayStr];
    return {
      date: format(day, "MMM d"),
      mood: entry ? entry.mood : null,
    };
  });

  const previousEntries = Object.entries(journalData)
    .map(([dateStr, entry]) => ({ dateStr, ...entry }))
    .sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());

  const checkInStreak = (() => {
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const day = addDays(new Date(), -i);
      const key = format(day, "yyyy-MM-dd");
      if (journalData[key]?.entry?.trim()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  })();

  const handleSaveEntry = async () => {
    if (!currentEntry) return;
    setIsSaving(true);
    // Mock saving data
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Saved:", currentEntry);
    setIsSaving(false);
  };
  
  const handleGenerateAffirmation = async () => {
    if (!currentEntry?.entry) return;
    setIsGenerating(true);
    setAffirmation(null);
    try {
      const result = await generateAffirmation({ needsAndGoals: currentEntry.entry });
      setAffirmation(result.affirmation);
    } catch (error) {
      console.error("Error generating affirmation:", error);
      setAffirmation("Could not generate an affirmation at this time. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleShareToCommunity = () => {
    // Mock functionality
    toast({
      title: "Shared to Community",
      description: "Your entry has been shared anonymously.",
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (date) {
      const newEntryText = e.target.value;
      const newEntry: JournalEntry = { 
        mood: currentEntry?.mood || 5,
        entry: newEntryText 
      };
      setJournalData(prev => ({ ...prev, [todayStr]: newEntry }));
    }
  };

return (
  <Card className="shadow-none border-none bg-transparent">
      <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-bold">Daily Diary & Progress</CardTitle>
          <CardDescription>Reflect on your day, track your mood, and see your journey.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
             
              <Card className="shadow-lg">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                          <BookCheck className="text-primary"/> Daily Reflection
                      </CardTitle>
                      <CardDescription>
                          {date ? format(date, "EEEE, MMMM do") : 'Select a day'}
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Textarea 
                          placeholder="How was your day? What's on your mind?" 
                          className="min-h-[120px] text-base"
                          value={currentEntry?.entry || ""}
                          onChange={handleTextChange}
                      />
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-2">
                       <Button variant="ghost" onClick={handleShareToCommunity} disabled={!currentEntry?.entry}>
                          <Share2 className="mr-2 h-4 w-4" /> Share Anonymously
                       </Button>
                       <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleGenerateAffirmation} disabled={isGenerating || !currentEntry?.entry}>
                              {isGenerating ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                              ) : (
                                <><Wand2 className="mr-2 h-4 w-4" /> Affirmation</>
                              )}
                           </Button>
                          <Button onClick={handleSaveEntry} disabled={isSaving}>
                            {isSaving ? (
                              <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                            ) : (
                              "Save Entry"
                            )}
                          </Button>
                       </div>
                  </CardFooter>
              </Card>

              {(isGenerating || affirmation) && (
                <Card className="shadow-lg animate-in fade-in-50 duration-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                            <Sparkles className="text-accent" /> Your Affirmation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        {isGenerating ? (
                           <div className="flex items-center gap-2 text-muted-foreground">
                             <Loader2 className="h-5 w-5 animate-spin" />
                             <span>Crafting something positive for you...</span>
                           </div>
                        ) : (
                           <blockquote className="text-base font-medium border-l-4 border-accent pl-4 italic">
                               {affirmation}
                           </blockquote>
                        )}
                    </CardContent>
                </Card>
              )}

              <Card className="shadow-lg">
                  <CardHeader>
                      <CardTitle>Your Weekly Mood</CardTitle>
                      <CardDescription>Visualize your emotional trends over the last 7 days.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] w-full">
                          <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0}}>
                          <CartesianGrid vertical={false} strokeDasharray="3 3" />
                          <XAxis
                              dataKey="date"
                              tickLine={false}
                              tickMargin={10}
                              axisLine={false}
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                          />
                            <YAxis
                              domain={[0, 10]}
                              tickLine={false}
                              axisLine={false}
                              tickMargin={10}
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                            />
                          <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="dot" />}
                          />
                          <Bar dataKey="mood" fill="var(--color-mood)" radius={window.innerWidth < 640 ? 4 : 8} />
                          </BarChart>
                      </ChartContainer>
                  </CardContent>
              </Card>
          </div>
          <div className="space-y-6">
                <Card className="shadow-lg">
                  <CardContent className="p-2 sm:p-4 flex justify-center">
                      <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          className="rounded-md"
                          modifiers={{
                              logged: Object.keys(journalData).map(dateStr => new Date(dateStr.replace(/-/g, '/')))
                          }}
                          modifiersStyles={{
                              logged: {
                                  borderColor: 'hsl(var(--primary))',
                                  borderWidth: '2px',
                              }
                          }}
                      />
                  </CardContent>
              </Card>
              <Card className="shadow-lg bg-gradient-to-br from-primary/80 to-accent/80 text-primary-foreground">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                          <Star />
                          Motivational Streak
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                      <p className="text-5xl font-bold">{checkInStreak}</p>
                      <p className="text-lg">days in a row!</p>
                      <p className="text-sm mt-2 opacity-90">Keep it up, you're doing great. 🌟</p>
                  </CardContent>
              </Card>
              <Card className="shadow-lg">
                  <CardHeader>
                      <CardTitle className="text-lg md:text-xl">Previous Entries</CardTitle>
                      <CardDescription>Tap a date to view or continue editing.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      {isLoading ? (
                        <div className="text-sm text-muted-foreground">Loading entries...</div>
                      ) : previousEntries.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No entries yet.</div>
                      ) : (
                        <ul className="space-y-3">
                          {previousEntries.slice(0, 10).map(({ dateStr, entry, mood }) => (
                            <li key={dateStr}>
                              <button
                                type="button"
                                className="w-full text-left p-3 rounded-md hover:bg-muted transition"
                                onClick={() => setDate(new Date(dateStr.replace(/-/g, '/')))}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{format(new Date(dateStr.replace(/-/g, '/')), 'EEE, MMM d, yyyy')}</span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Mood: {mood}</span>
                                </div>
                                <p className="mt-1 text-sm line-clamp-2 text-muted-foreground">{entry}</p>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                  </CardContent>
              </Card>
          </div>
      </CardContent>
  </Card>
);
}

    