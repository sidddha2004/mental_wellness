"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MessageSquare, BookOpen, Search, Plus, User, Star, ThumbsUp } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useAuth } from "@/contexts/auth-context";

// Function to generate anonymous username from original name
const generateAnonymousUsername = (originalName: string, id: number): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const hash = originalName.split('').reduce((acc, char) => acc + char.charCodeAt(0), id * 7);
  let result = 'user';
  for (let i = 0; i < 4; i++) {
    result += chars[Math.abs(hash + i * 13) % chars.length];
  }
  return result;
};

// Individual Story Card Component
const StoryCard = memo(({ 
  item, 
  isExpanded, 
  onToggleExpansion, 
  onComment 
}: { 
  item: any;
  isExpanded: boolean;
  onToggleExpansion: (id: number) => void;
  onComment: (id: number) => void;
}) => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            <AvatarImage src={item.avatar} alt={item.anonymousName} data-ai-hint="person"/>
            <AvatarFallback>{item.anonymousName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{item.anonymousName}</p>
            <p className="text-xs text-muted-foreground">Shared anonymously</p>
          </div>
        </div>
        <CardTitle className="text-lg leading-snug">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="text-sm text-muted-foreground mb-4">
          {isExpanded ? (
            <div className="whitespace-pre-line">
              {item.fullContent}
            </div>
          ) : (
            <p>{item.preview}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag: string) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
        </div>
      </CardContent>
      <CardContent className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground"
            onClick={() => onToggleExpansion(item.id)}
          >
            <BookOpen className="mr-2 h-4 w-4"/>
            {isExpanded ? "Show Less" : "Read More"}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground"
            onClick={() => onComment(item.id)}
          >
            <MessageSquare className="mr-2 h-4 w-4"/>
            {item.comments}
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground">
          <Heart className="h-5 w-5 hover:fill-red-500 hover:text-red-500 transition-colors"/>
          <span className="font-semibold">{item.likes}</span>
        </Button>
      </CardContent>
    </Card>
  );
});

const stories = [
    {
        id: 1,
        author: "Aakash", // Original name for generating hash
        anonymousName: generateAnonymousUsername("Aakash", 1),
        avatar: "https://picsum.photos/40/40?random=1",
        title: "It's Okay to Feel Lost Sometimes",
        preview: "Finding the courage to talk about my anxiety was the first step. For the longest time, I thought I was the only one feeling this pressure...",
        fullContent: "Finding the courage to talk about my anxiety was the first step. For the longest time, I thought I was the only one feeling this pressure from exams, career choices, and family expectations. I kept thinking I was weak for feeling overwhelmed when everyone else seemed to have it figured out.\n\nBut then I realized that feeling lost is part of growing up. It's okay to not know what comes next. It's okay to feel scared about the future. What helped me was talking to a counselor and realizing that my feelings were valid.\n\nNow I practice mindfulness daily and remind myself that it's okay to take things one step at a time. You don't have to have all the answers right now. Be gentle with yourself - you're doing better than you think.",
        tags: ["Exam Stress", "Anxiety"],
        likes: 12,
        comments: 8,
    },
    {
        id: 2,
        author: "Priya",
        anonymousName: generateAnonymousUsername("Priya", 2),
        avatar: "https://picsum.photos/40/40?random=2",
        title: "You Are Not Alone",
        preview: "I felt so alone during my first year of college. The workload, being away from home... reading stories here made me realize I wasn't...",
        fullContent: "I felt so alone during my first year of college. The workload, being away from home, making new friends - everything felt overwhelming. I would cry myself to sleep thinking I made the wrong choice.\n\nReading stories here made me realize I wasn't alone in feeling this way. So many of us go through this transition period where everything feels uncertain. The key is reaching out and not isolating yourself.\n\nI joined a study group, started calling home more often, and found a hobby I enjoyed. Slowly, things got better. College became less scary and more exciting. Remember, it's okay to miss home while building a new life.",
        tags: ["Relationships", "College Life"],
        likes: 25,
        comments: 15,
    },
     {
        id: 3,
        author: "Rohan",
        anonymousName: generateAnonymousUsername("Rohan", 3),
        avatar: "https://picsum.photos/40/40?random=3",
        title: "A Journey to Self-Kindness",
        preview: "It's okay to not be okay. I used to be so hard on myself for every little mistake. Learning to be kind to myself has been a journey, not a destination...",
        fullContent: "It's okay to not be okay. I used to be so hard on myself for every little mistake. Learning to be kind to myself has been a journey, not a destination. I would beat myself up over small failures, compare myself to others constantly, and never celebrate my wins.\n\nThe turning point came when I started treating myself like I would treat a good friend. Would I tell my friend they're worthless for making a mistake? Never. So why was I doing that to myself?\n\nI started practicing self-compassion daily. When negative thoughts come up, I acknowledge them but don't let them define me. I celebrate small victories and learn from setbacks without judgment. This shift in mindset has been life-changing.",
        tags: ["Self-Esteem"],
        likes: 38,
        comments: 22,
    },
    {
        id: 4,
        author: "Sneha",
        anonymousName: generateAnonymousUsername("Sneha", 4),
        avatar: "https://picsum.photos/40/40?random=4",
        title: "Sharing My Own Story",
        preview: "Reading all the anonymous stories here gave me the strength to finally pen down my own. We are all in this together, and our experiences connect us...",
        fullContent: "Reading all the anonymous stories here gave me the strength to finally pen down my own. We are all in this together, and our experiences connect us in ways we don't even realize.\n\nI was struggling with career pressure from my family. They wanted me to pursue engineering, but my heart was in creative writing. The conflict was tearing me apart. I felt like I was disappointing everyone no matter what I chose.\n\nSeeing stories of people who chose their own path gave me courage. I had honest conversations with my family, showed them my writing, and explained my passion. It wasn't easy, but gradually they understood. Now I'm pursuing my dream while maintaining family relationships.\n\nYour story matters. Your struggles are valid. And sharing them helps not just you, but others who read and think 'I'm not alone in this.'",
        tags: ["Community", "Career Pressure"],
        likes: 19,
        comments: 12,
    }
]

const filters = ["All", "Exam Stress", "Relationships", "Career Pressure", "Anxiety", "Self-Esteem"];

export function CommunityStoriesSection() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isSearching, setIsSearching] = useState(false);
  const [filteredStories, setFilteredStories] = useState(stories);
  const [expandedStories, setExpandedStories] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState("all-stories");

  // Mock data for user's personal story collections (will be replaced with API calls)
  const [userStories, setUserStories] = useState<typeof stories>([]);
  const [likedStories, setLikedStories] = useState<typeof stories>([]);
  const [favoriteStories, setFavoriteStories] = useState<typeof stories>([]);
  const [commentedStories, setCommentedStories] = useState<typeof stories>([]);

  // Function to search stories via backend API
  const searchStories = async (query: string, filter: string) => {
    if (!user) return;

    setIsSearching(true);
    try {
      const token = await user.getIdToken();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      const params = new URLSearchParams({
        q: query,
        filter: filter === "All" ? "" : filter,
        limit: "20"
      });

      const response = await fetch(`${backendUrl}/api/community/stories/search?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setFilteredStories(result.data || []);
      } else {
        // Fallback to client-side filtering if API fails
        performClientSideFilter(query, filter);
      }
    } catch (error) {
      console.error('Search API error:', error);
      // Fallback to client-side filtering
      performClientSideFilter(query, filter);
    } finally {
      setIsSearching(false);
    }
  };

  // Client-side filtering as fallback
  const performClientSideFilter = (query: string, filter: string) => {
    let filtered = stories;

    if (filter !== "All") {
      filtered = filtered.filter(story => 
        story.tags.some(tag => tag.toLowerCase() === filter.toLowerCase())
      );
    }

    if (query.trim()) {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(query.toLowerCase()) ||
        story.preview.toLowerCase().includes(query.toLowerCase()) ||
        story.fullContent.toLowerCase().includes(query.toLowerCase()) ||
        story.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        story.anonymousName.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredStories(filtered);
  };

  // Effect to handle search/filter changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (user) {
        searchStories(searchQuery, selectedFilter);
      } else {
        performClientSideFilter(searchQuery, selectedFilter);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedFilter, user]);

  const handleFilterClick = (filter: string) => {
    setSelectedFilter(filter);
  };

  const toggleStoryExpansion = useCallback((storyId: number) => {
    setExpandedStories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storyId)) {
        newSet.delete(storyId);
      } else {
        newSet.add(storyId);
      }
      return newSet;
    });
  }, []);

  const handleComment = async (storyId: number) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      // This would open a comment modal/drawer in a real implementation
      // For now, we'll just log the action
      console.log(`Opening comments for story ${storyId}`);
      
      // Future API call would be:
      // const response = await fetch(`${backendUrl}/api/community/stories/${storyId}/comments`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      
    } catch (error) {
      console.error('Comment action error:', error);
    }
  };

  const handlePostStory = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      // This would open a post story modal/form in a real implementation
      console.log('Opening post story form');
      
      // Future API call would be:
      // const response = await fetch(`${backendUrl}/api/community/stories`, {
      //   method: 'POST',
      //   headers: { 
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ title, content, tags })
      // });
      
    } catch (error) {
      console.error('Post story error:', error);
    }
  };

  const loadUserStories = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      console.log('Loading user stories');
      
      // Future API calls:
      // My Stories: GET /api/community/stories/my
      // Liked Stories: GET /api/community/stories/liked
      // Favorite Stories: GET /api/community/stories/favorites
      // Commented Stories: GET /api/community/stories/commented
      
    } catch (error) {
      console.error('Load stories error:', error);
    }
  };

  // Helper function to render stories content
  const renderStoriesContent = (storiesToRender: typeof stories, loading: boolean) => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Searching stories...</div>
        </div>
      );
    }

    if (storiesToRender.length === 0) {
      return (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No stories found</p>
          <p className="text-muted-foreground text-sm mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {storiesToRender.map((item) => (
            <StoryCard
              key={`story-${item.id}`}
              item={item}
              isExpanded={expandedStories.has(item.id)}
              onToggleExpansion={toggleStoryExpansion}
              onComment={handleComment}
            />
          ))}
        </div>
        
        {/* Load More Button */}
        {storiesToRender.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline">Load More Stories</Button>
          </div>
        )}
      </>
    );
  };
  return (
    <Card className="shadow-none border-none bg-transparent">
        <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <CardTitle className="text-xl md:text-2xl font-bold">Community Stories</CardTitle>
                    <CardDescription>Read anonymous, real experiences from your peers. You are not alone.</CardDescription>
                </div>
                <Button 
                    onClick={handlePostStory}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                    size="sm"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Share Your Story
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            {/* Tabs for different story collections */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto mb-6">
                    <TabsTrigger value="all-stories" className="py-2 px-3 gap-2 text-xs md:text-sm">
                        <BookOpen className="h-4 w-4" />
                        All Stories
                    </TabsTrigger>
                    <TabsTrigger value="my-stories" className="py-2 px-3 gap-2 text-xs md:text-sm">
                        <User className="h-4 w-4" />
                        My Stories
                    </TabsTrigger>
                    <TabsTrigger value="liked" className="py-2 px-3 gap-2 text-xs md:text-sm">
                        <ThumbsUp className="h-4 w-4" />
                        Liked
                    </TabsTrigger>
                    <TabsTrigger value="favorites" className="py-2 px-3 gap-2 text-xs md:text-sm">
                        <Star className="h-4 w-4" />
                        Favorites
                    </TabsTrigger>
                    <TabsTrigger value="commented" className="py-2 px-3 gap-2 text-xs md:text-sm">
                        <MessageSquare className="h-4 w-4" />
                        Commented
                    </TabsTrigger>
                </TabsList>

                {/* All Stories Tab */}
                <TabsContent value="all-stories" className="space-y-6">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search stories by mood, tags, or content..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-11 rounded-full border-primary/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm"
                            />
                        </div>
                    </div>

                    {/* Filter Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {filters.map(filter => (
                            <Button 
                                key={filter} 
                                variant={filter === selectedFilter ? 'default' : 'outline'} 
                                size="sm"
                                onClick={() => setSelectedFilter(filter)}
                                className="rounded-full"
                            >
                                {filter}
                            </Button>
                        ))}
                    </div>

                    {/* Stories Content */}
                    {renderStoriesContent(filteredStories, isSearching)}
                </TabsContent>

                {/* My Stories Tab */}
                <TabsContent value="my-stories" className="space-y-6">
                    <div className="text-center py-12">
                        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">Your Stories</p>
                        <p className="text-muted-foreground text-sm mt-2">
                            Stories you've shared with the community will appear here
                        </p>
                        <Button 
                            onClick={handlePostStory}
                            variant="outline" 
                            className="mt-4 rounded-full"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Post Your First Story
                        </Button>
                    </div>
                </TabsContent>

                {/* Liked Stories Tab */}
                <TabsContent value="liked" className="space-y-6">
                    <div className="text-center py-12">
                        <ThumbsUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">Liked Stories</p>
                        <p className="text-muted-foreground text-sm mt-2">
                            Stories you've liked will appear here
                        </p>
                    </div>
                </TabsContent>

                {/* Favorite Stories Tab */}
                <TabsContent value="favorites" className="space-y-6">
                    <div className="text-center py-12">
                        <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">Favorite Stories</p>
                        <p className="text-muted-foreground text-sm mt-2">
                            Stories you've marked as favorites will appear here
                        </p>
                    </div>
                </TabsContent>

                {/* Commented Stories Tab */}
                <TabsContent value="commented" className="space-y-6">
                    <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">Commented Stories</p>
                        <p className="text-muted-foreground text-sm mt-2">
                            Stories you've commented on will appear here
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}