
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, ChevronRight, MessageSquare, User } from "lucide-react";
import { useBlog, useBlogs } from "@/hooks/useBlogs";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Comment {
  id: string;
  blogId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: any;
}

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const { data: blog, isLoading } = useBlog(id);
  const { data: blogs = [] } = useBlogs();
  const { currentUser } = useAuth();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get related blogs (excluding the current one)
  const relatedBlogs = blogs
    .filter(b => b.id !== id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  // Fetch comments
  useEffect(() => {
    if (!id) return;

    const fetchComments = async () => {
      try {
        const q = query(
          collection(db, "comments"),
          where("blogId", "==", id),
          orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedComments: Comment[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedComments.push({
            id: doc.id,
            ...doc.data()
          } as Comment);
        });
        
        setComments(fetchedComments);
      } catch (error) {
        console.error("Error fetching comments:", error);
        toast.error("Failed to load comments");
      }
    };

    fetchComments();
  }, [id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("Please sign in to leave a comment");
      return;
    }
    
    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const commentData = {
        blogId: id,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || "Anonymous",
        content: comment,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, "comments"), commentData);
      
      const newComment = {
        id: docRef.id,
        ...commentData,
        createdAt: new Date()
      };
      
      setComments(prevComments => [newComment, ...prevComments]);
      setComment("");
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="aspect-video bg-gray-200 rounded mb-8"></div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
            <p className="mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/blogs">Back to Blogs</Link>
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
      
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="inline h-4 w-4 mx-1" />
            <Link to="/blogs" className="hover:text-primary">Blog</Link>
            <ChevronRight className="inline h-4 w-4 mx-1" />
            <span>{blog.title}</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>
              
              <div className="flex items-center text-sm text-muted-foreground mb-6">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{blog.author}</span>
                </div>
                <div className="mx-2">•</div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mx-2">•</div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{comments.length} comments</span>
                </div>
              </div>
              
              {/* Featured Image */}
              {blog.image && (
                <div className="mb-8">
                  <img 
                    src={blog.image} 
                    alt={blog.title} 
                    className="w-full h-auto rounded-lg object-cover"
                  />
                </div>
              )}
              
              {/* Blog Content */}
              <div className="prose max-w-none mb-12">
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
              </div>
              
              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-12">
                  {blog.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Comments Section */}
              <div className="border-t pt-12">
                <h2 className="text-2xl font-semibold mb-6">Comments ({comments.length})</h2>
                
                {/* Comment Form */}
                <div className="mb-12">
                  <h3 className="text-lg font-medium mb-4">Leave a Comment</h3>
                  
                  {currentUser ? (
                    <form onSubmit={handleSubmitComment}>
                      <Textarea
                        placeholder="Write your comment here..."
                        className="mb-4"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                      />
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Post Comment"}
                      </Button>
                    </form>
                  ) : (
                    <div className="bg-secondary p-4 rounded-lg">
                      <p className="mb-4">Please sign in to leave a comment.</p>
                      <Button asChild>
                        <Link to="/sign-in">Sign In</Link>
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Comments List */}
                <div className="space-y-8">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="border-b pb-8">
                        <div className="flex items-center mb-2">
                          <div className="bg-primary text-primary-foreground h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                            {comment.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{comment.userName}</p>
                            <p className="text-xs text-muted-foreground">
                              {comment.createdAt?.toDate 
                                ? comment.createdAt.toDate().toLocaleDateString() 
                                : new Date().toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-600">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div>
              {/* About Author */}
              <div className="bg-card p-6 rounded-lg shadow-sm border mb-8">
                <h3 className="text-lg font-semibold mb-4">About the Author</h3>
                <div className="flex items-center mb-4">
                  <div className="bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg mr-3">
                    {blog.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{blog.author}</p>
                    <p className="text-sm text-muted-foreground">Content Writer</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Passionate about sharing knowledge and insights on the latest trends 
                  and innovations in the industry.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View All Posts
                </Button>
              </div>
              
              {/* Search */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Search</h3>
                <form className="flex gap-2">
                  <Input type="text" placeholder="Search articles..." className="flex-1" />
                  <Button type="submit">Search</Button>
                </form>
              </div>
              
              {/* Related Posts */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Related Posts</h3>
                <div className="space-y-4">
                  {relatedBlogs.map((blog) => (
                    <div key={blog.id} className="flex gap-3">
                      {blog.image && (
                        <img 
                          src={blog.image} 
                          alt={blog.title} 
                          className="w-20 h-16 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div>
                        <Link 
                          to={`/blogs/${blog.id}`} 
                          className="font-medium hover:text-primary transition-colors line-clamp-2"
                        >
                          {blog.title}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {relatedBlogs.length === 0 && (
                    <p className="text-muted-foreground text-sm">No related posts found.</p>
                  )}
                </div>
              </div>
              
              {/* Popular Tags */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {["ecommerce", "shopping", "online", "retail", "products", "digital", "tips"].map((tag) => (
                    <Link 
                      key={tag} 
                      to={`/blogs?tag=${tag}`}
                      className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
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
