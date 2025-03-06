
import { useState, useEffect } from "react";
import { ExternalLink, Instagram, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Define Instagram post type
interface InstagramPost {
  id: string;
  media_url: string;
  caption: string;
  permalink: string;
  timestamp: string;
  media_type: string;
}

export const InstagramFeed = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const INSTAGRAM_TOKEN = import.meta.env.VITE_INSTAGRAM_TOKEN || localStorage.getItem('instagram_token');
  const username = "nytheris.pk"; // Your Instagram username
  
  // Function to fetch posts from Instagram API
  const fetchInstagramPosts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // If no token is available, use fallback data
      if (!INSTAGRAM_TOKEN) {
        throw new Error("No Instagram token available");
      }
      
      const response = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${INSTAGRAM_TOKEN}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch Instagram posts");
      }
      
      const data = await response.json();
      
      // Filter to only include images and videos
      const filteredPosts = data.data
        .filter((post: any) => 
          post.media_type === 'IMAGE' || 
          post.media_type === 'CAROUSEL_ALBUM' ||
          post.media_type === 'VIDEO'
        )
        .slice(0, 4); // Limit to 4 posts
      
      setPosts(filteredPosts);
    } catch (err) {
      console.error("Instagram fetch error:", err);
      setError("Could not load Instagram feed");
      // Use fallback data when API fails
      useFallbackData();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fallback data when API fails
  const useFallbackData = () => {
    // This is the same mock data as before
    const FALLBACK_POSTS = [
      {
        id: "1",
        media_url: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=60",
        caption: "Street vibes 🔥 #NytherisStyle",
        permalink: "https://instagram.com",
        timestamp: new Date().toISOString(),
        media_type: "IMAGE"
      },
      {
        id: "2",
        media_url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=60",
        caption: "New collection dropping soon! #UrbanFashion",
        permalink: "https://instagram.com",
        timestamp: new Date().toISOString(),
        media_type: "IMAGE"
      },
      {
        id: "3",
        media_url: "https://images.unsplash.com/photo-1508216404536-eecebd8b6f84?w=800&auto=format&fit=crop&q=60",
        caption: "Styling our bestseller jacket 💯 #Nytheris",
        permalink: "https://instagram.com",
        timestamp: new Date().toISOString(),
        media_type: "IMAGE"
      },
      {
        id: "4",
        media_url: "https://images.unsplash.com/photo-1537832816519-689ad163238b?w=800&auto=format&fit=crop&q=60",
        caption: "Behind the scenes at our latest photoshoot #TeamNytheris",
        permalink: "https://instagram.com",
        timestamp: new Date().toISOString(),
        media_type: "IMAGE"
      }
    ];
    
    setPosts(FALLBACK_POSTS);
    toast.warning("Using demo Instagram data. Set up your Instagram token for live data.", {
      duration: 5000,
    });
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    fetchInstagramPosts();
    toast.info("Refreshing Instagram feed...");
  };
  
  // Fetch posts on component mount
  useEffect(() => {
    fetchInstagramPosts();
  }, []);
  
  // Helper to get post time in relative format
  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 7) {
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }).format(date);
    } else if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Instagram className="h-5 w-5 text-pink-600" />
          <h3 className="font-medium">@{username}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            className="p-1 h-auto"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <a 
            href={`https://instagram.com/${username}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-medium flex items-center gap-1 text-gray-600 hover:text-primary transition-colors"
          >
            Follow us <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
      
      {error && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {posts.map((post) => (
          <a 
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer" 
            className="group block relative aspect-square overflow-hidden rounded-lg"
          >
            <img 
              src={post.media_url} 
              alt={post.caption || "Instagram post"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="text-white text-center p-4">
                <p className="text-xs mb-2 line-clamp-3">{post.caption}</p>
                <div className="flex justify-center gap-3 text-xs">
                  <span>{getRelativeTime(post.timestamp)}</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
      
      <div className="text-center">
        <Button asChild variant="outline" size="sm">
          <a 
            href={`https://instagram.com/${username}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            <Instagram className="h-4 w-4" />
            View more on Instagram
          </a>
        </Button>
      </div>
    </div>
  );
};

