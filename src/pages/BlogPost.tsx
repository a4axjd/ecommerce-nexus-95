
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useBlog, useBlogs } from "@/hooks/useBlogs";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  CalendarIcon, 
  Clock, 
  User, 
  Tag, 
  Share2, 
  Bookmark, 
  MessageSquare,
  Twitter,
  Facebook,
  Linkedin
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const { data: blog, isLoading, error } = useBlog(id || "");
  const { data: allBlogs = [] } = useBlogs();

  // Get related blog posts (sharing tags with current blog)
  const relatedBlogs = allBlogs
    .filter(b => b.id !== id && b.tags.some(tag => blog?.tags.includes(tag)))
    .slice(0, 3);

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
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link to="/blogs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to all articles
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-8">
              <article className="max-w-3xl">
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
                  
                  <h1 className="text-3xl md:text-4xl font-bold mb-6">{blog.title}</h1>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar>
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${blog.author}&background=random`} />
                      <AvatarFallback>{blog.author[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{blog.author}</p>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {formatDate(blog.createdAt)}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {calculateReadTime(blog.content)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Hero image */}
                <img 
                  src={blog.imageUrl} 
                  alt={blog.title} 
                  className="w-full h-72 md:h-96 object-cover rounded-lg mb-8"
                />
                
                {/* Article content */}
                <div className="prose prose-lg max-w-none mb-10">
                  {blog.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-6">{paragraph}</p>
                  ))}
                </div>
                
                {/* Tags */}
                <div className="flex items-center flex-wrap gap-2 mb-8">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Tags:</span>
                  {blog.tags.map(tag => (
                    <Link 
                      key={tag} 
                      to={`/blogs?tag=${tag}`}
                      className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
                
                {/* Article footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4" />
                      <span className="hidden sm:inline">Save</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="hidden sm:inline">Comment</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground mr-2">Share:</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Facebook className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Linkedin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            </div>

            {/* Sidebar */}
            <div className="md:col-span-4 space-y-8">
              {/* Author card */}
              <div className="bg-secondary/40 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${blog.author}&background=random&size=96`} />
                    <AvatarFallback>{blog.author[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{blog.author}</h3>
                    <p className="text-sm text-muted-foreground">Contributing Writer</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor.
                </p>
                <Button variant="outline" className="w-full text-sm">View Profile</Button>
              </div>

              {/* Related posts */}
              {relatedBlogs.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-4">Related Articles</h3>
                  <div className="space-y-6">
                    {relatedBlogs.map(relatedBlog => (
                      <Link 
                        key={relatedBlog.id} 
                        to={`/blogs/${relatedBlog.id}`}
                        className="flex gap-4 group"
                      >
                        <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
                          <img 
                            src={relatedBlog.imageUrl} 
                            alt={relatedBlog.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                            {relatedBlog.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(relatedBlog.createdAt)}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {calculateReadTime(relatedBlog.content)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter signup */}
              <div className="bg-primary/5 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">Subscribe to our newsletter</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get the latest posts and updates delivered to your inbox.
                </p>
                <div className="space-y-2">
                  <Input placeholder="Your email address" type="email" />
                  <Button className="w-full">Subscribe</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPost;
