
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBlogs, useCreateBlog, useUpdateBlog, useDeleteBlog, Blog } from "@/hooks/useBlogs";
import { Pencil, Trash, LogOut, PlusCircle, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const BlogAdmin = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: blogs, isLoading } = useBlogs();
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const deleteBlog = useDeleteBlog();
  
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    imageUrl: "",
    tags: "",
    featured: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      toast.info("Already processing your request...");
      return;
    }
    
    setIsSubmitting(true);
    toast.info(selectedBlog ? "Updating blog post..." : "Creating blog post...");
    
    try {
      const blogData = {
        title: formData.title,
        content: formData.content,
        author: formData.author,
        imageUrl: formData.imageUrl,
        tags: formData.tags.split(',').map(tag => tag.trim()),
        createdAt: selectedBlog?.createdAt || Date.now(),
        featured: formData.featured,
      };

      if (selectedBlog) {
        await updateBlog.mutateAsync({
          id: selectedBlog.id,
          ...blogData
        });
        toast.success("Blog post updated successfully");
      } else {
        await createBlog.mutateAsync(blogData);
        toast.success("Blog post created successfully");
      }

      // Reset form
      setFormData({
        title: "",
        content: "",
        author: "",
        imageUrl: "",
        tags: "",
        featured: false,
      });
      setSelectedBlog(null);
    } catch (error) {
      console.error("Error saving blog post:", error);
      toast.error("Error saving blog post: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (blog: Blog) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      author: blog.author,
      imageUrl: blog.imageUrl,
      tags: blog.tags.join(', '),
      featured: blog.featured || false,
    });
  };

  const handleDelete = async (blogId: string) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        await deleteBlog.mutateAsync(blogId);
        toast.success("Blog post deleted successfully");
      } catch (error) {
        console.error("Error deleting blog post:", error);
        toast.error("Error deleting blog post: " + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold">Blog Management</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate("/admin")}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Manage Products
              </Button>
              <p className="text-sm text-muted-foreground">
                Signed in as {currentUser?.email}
              </p>
              <Button variant="outline" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-6">
                {selectedBlog ? "Edit Blog Post" : "Create New Blog Post"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <Input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="author" className="block text-sm font-medium mb-1">
                    Author
                  </label>
                  <Input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
                    Image URL
                  </label>
                  <Input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium mb-1">
                    Tags (comma separated)
                  </label>
                  <Input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="news, tips, tutorial"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="featured" className="block text-sm font-medium">
                    Feature on Home Page
                  </label>
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium mb-1">
                    Content
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    className="w-full min-h-[300px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting 
                      ? "Processing..." 
                      : selectedBlog 
                        ? "Update Blog Post" 
                        : "Create Blog Post"
                    }
                  </Button>
                  {selectedBlog && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedBlog(null);
                        setFormData({
                          title: "",
                          content: "",
                          author: "",
                          imageUrl: "",
                          tags: "",
                          featured: false,
                        });
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Blog Posts</h2>
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : blogs?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No blog posts found</p>
                  <Button onClick={() => {
                    setSelectedBlog(null);
                    setFormData({
                      title: "",
                      content: "",
                      author: "",
                      imageUrl: "",
                      tags: "",
                      featured: false,
                    });
                  }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Blog Post
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {blogs?.map((blog) => (
                    <div
                      key={blog.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={blog.imageUrl}
                            alt={blog.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          {blog.featured && (
                            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1" title="Featured on home page">
                              <Star className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{blog.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            By {blog.author} | {new Date(blog.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(blog)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(blog.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogAdmin;
