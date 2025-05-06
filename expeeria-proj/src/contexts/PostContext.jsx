import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const PostContext = createContext();

export const usePosts = () => useContext(PostContext);

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca posts do backend (JSON Server)
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/posts");
      setPosts(res.data);
    } catch {
      setPosts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Adiciona novo post
  const addPost = async (post) => {
    const res = await axios.post("http://localhost:5000/posts", post);
    setPosts([res.data, ...posts]);
  };

  const likePost = async (id) => {
    const post = posts.find((p) => String(p.id) === String(id));
    if (!post) return;
    const updatedLikes = (post.likes || 0) + 1;
    await axios.patch(`http://localhost:5000/posts/${id}`, {
      likes: updatedLikes,
    });
    setPosts(
      posts.map((p) =>
        String(p.id) === String(id) ? { ...p, likes: updatedLikes } : p
      )
    );
  };

  const addComment = async (postId, comment) => {
    const post = posts.find((p) => String(p.id) === String(postId));
    if (!post) return;
    const newComment = { id: `${Date.now()}-${Math.random()}`, ...comment };
    const updatedComments = [...(post.comments || []), newComment];
    await axios.patch(`http://localhost:5000/posts/${postId}`, {
      comments: updatedComments,
    });
    setPosts(
      posts.map((p) =>
        String(p.id) === String(postId)
          ? { ...p, comments: updatedComments }
          : p
      )
    );
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredPosts = searchTerm
    ? posts.filter(
        (p) =>
          (p.title &&
            p.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.area && p.area.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.author &&
            p.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.content &&
            p.content.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : posts;

  const deletePost = async (id) => {
    await axios.delete(`http://localhost:5000/posts/${id}`);
    fetchPosts();
  };

  const editPost = async (id, updatedData) => {
    await axios.put(`http://localhost:5000/posts/${id}`, updatedData);
    fetchPosts();
  };

  return (
    <PostContext.Provider
      value={{
        posts: filteredPosts,
        loading,
        fetchPosts,
        addPost,
        likePost,
        addComment,
        setSearchTerm,
        deletePost, 
        editPost,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};
