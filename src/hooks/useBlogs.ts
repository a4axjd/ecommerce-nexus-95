
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Blog {
  id: string;
  title: string;
  content: string;
  author: string;
  imageUrl: string;
  createdAt: number;
  tags: string[];
  featured?: boolean;
}

export const useBlogs = () => {
  return useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "blogs"));
      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Blog[];
    },
  });
};

export const useFeaturedBlogs = () => {
  return useQuery({
    queryKey: ["featuredBlogs"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "blogs"));
      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((blog: Blog) => blog.featured === true) as Blog[];
    },
  });
};

export const useBlog = (id: string) => {
  return useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      if (!id) return null;
      const docRef = doc(db, "blogs", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Blog;
    },
    enabled: !!id,
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (blog: Omit<Blog, "id">) => {
      const docRef = await addDoc(collection(db, "blogs"), blog);
      return { id: docRef.id, ...blog };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["featuredBlogs"] });
    },
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...blog }: Blog) => {
      await updateDoc(doc(db, "blogs", id), blog);
      return { id, ...blog };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", data.id] });
      queryClient.invalidateQueries({ queryKey: ["featuredBlogs"] });
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "blogs", id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["featuredBlogs"] });
    },
  });
};
