
import { useState } from "react";
import { collection, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBlogs, Blog } from "@/hooks/useBlogs";
import { Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/AdminSidebar";

const BlogAdmin = () => {
  const { data: blogs, isLoading, refetch } = useBlogs();
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    author: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const blogData = {
        title: formData.title,
        content: formData.content,
        image: formData.image,
        author: formData.author,
        createdAt: selectedBlog ? selectedBlog.createdAt : Date.now(),
      };

      if (selectedBlog) {
        await updateDoc(doc(db, "blogs", selectedBlog.id), blogData);
        toast.success("Blog post updated successfully");
      } else {
        await addDoc(collection(db, "blogs"), blogData);
        toast.success("Blog post added successfully");
      }

      // Reset the form
      setFormData({
        title: "",
        content: "",
        image: "",
        author: "",
      });
      setSelectedBlog(null);
      
      // Refresh the blogs list
      refetch();
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
      image: blog.image,
      author: blog.author,
    });
  };

  const handleDelete = async (blogId: string) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        await deleteDoc(doc(db, "blogs", blogId));
        toast.success("Blog post deleted successfully");
        refetch();
      } catch (error) {
        console.error("Error deleting blog post:", error);
        toast.error("Error deleting blog post: " + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold mb-8">Blog Management</h1>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-6">
                {selectedBlog ? "Edit Blog Post" : "Add New Blog Post"}
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
                  <label htmlFor="content" className="block text-sm font-medium mb-1">
                    Content
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="image" className="block text-sm font-medium mb-1">
                    Image URL
                  </label>
                  <Input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
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

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting 
                      ? "Processing..." 
                      : selectedBlog 
                        ? "Update Blog Post" 
                        : "Add Blog Post"
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
                          image: "",
                          author: "",
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
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : blogs?.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No blog posts found. Add your first blog post above.
                  </p>
                ) : (
                  blogs?.map((blog) => (
                    <div
                      key={blog.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-medium">{blog.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            By {blog.author} • {new Date(blog.createdAt).toLocaleDateString()}
                          </p>
                          <p className="mt-1 text-sm line-clamp-2">
                            {blog.content}
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
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogAdmin;
