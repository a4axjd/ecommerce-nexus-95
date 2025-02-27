
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useBlog } from "@/hooks/useBlogs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarIcon, Clock, User } from "lucide-react";

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const { data: blog, isLoading, error } = useBlog(id || "");

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const calculateReadTime = (content: string) => {
    if (!content) return "";
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 pt-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
            <p className="text-muted-foreground mb-6">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/blogs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blogs
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24 pb-12">
        <article className="max-w-3xl mx-auto">
          <Link to="/blogs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all articles
          </Link>
          
          {/* Hero image */}
          <img 
            src={blog.imageUrl} 
            alt={blog.title} 
            className="w-full h-72 md:h-96 object-cover rounded-lg mb-8"
          />
          
          {/* Article header */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.map(tag => (
                <span 
                  key={tag} 
                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {blog.author}
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                {formatDate(blog.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {calculateReadTime(blog.content)}
              </div>
            </div>
          </div>
          
          {/* Article content */}
          <div className="prose prose-lg max-w-none">
            {blog.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-6">{paragraph}</p>
            ))}
          </div>
          
          {/* Article footer */}
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-4">Share this article</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Twitter
              </Button>
              <Button variant="outline" size="sm">
                Facebook
              </Button>
              <Button variant="outline" size="sm">
                LinkedIn
              </Button>
            </div>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPost;
