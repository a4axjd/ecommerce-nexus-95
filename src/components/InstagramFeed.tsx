
import { useState, useEffect } from "react";
import { ExternalLink, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock Instagram data (replace with actual API integration)
const INSTAGRAM_POSTS = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=60",
    caption: "Street vibes 🔥 #NytherisStyle",
    likes: 324,
    comments: 18,
    url: "https://instagram.com"
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=60",
    caption: "New collection dropping soon! #UrbanFashion",
    likes: 472,
    comments: 35,
    url: "https://instagram.com"
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1508216404536-eecebd8b6f84?w=800&auto=format&fit=crop&q=60",
    caption: "Styling our bestseller jacket 💯 #Nytheris",
    likes: 287,
    comments: 24,
    url: "https://instagram.com"
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1537832816519-689ad163238b?w=800&auto=format&fit=crop&q=60",
    caption: "Behind the scenes at our latest photoshoot #TeamNytheris",
    likes: 198,
    comments: 12,
    url: "https://instagram.com"
  }
];

export const InstagramFeed = () => {
  const [posts, setPosts] = useState(INSTAGRAM_POSTS);
  const [isLoading, setIsLoading] = useState(false);

  // Simulating fetch from API
  useEffect(() => {
    setIsLoading(true);
    // In a real implementation, you would fetch data from Instagram API here
    setTimeout(() => {
      setPosts(INSTAGRAM_POSTS);
      setIsLoading(false);
    }, 1000);
  }, []);

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
          <h3 className="font-medium">@nytheris.pk</h3>
        </div>
        <a 
          href="https://instagram.com/nytheris.pk" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs font-medium flex items-center gap-1 text-gray-600 hover:text-primary transition-colors"
        >
          Follow us <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {posts.map((post) => (
          <a 
            key={post.id}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer" 
            className="group block relative aspect-square overflow-hidden rounded-lg"
          >
            <img 
              src={post.image} 
              alt={post.caption}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="text-white text-center p-4">
                <p className="text-xs mb-2">{post.caption}</p>
                <div className="flex justify-center gap-3 text-xs">
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
      
      <div className="text-center">
        <Button asChild variant="outline" size="sm">
          <a 
            href="https://instagram.com/nytheris.pk" 
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
