import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Feed.module.css";
import { API_URL } from "../config";

interface Post {
  _id: string; // Изменено с id: number на _id: string
  username: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

interface FeedProps {
  token: string | null;
}

const Feed = ({ token }: FeedProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${API_URL}/posts`);

        setPosts(response.data);
        if (token) {
          const userResponse = await axios.get(`${API_URL}/me`, {
            headers: { Authorization: token },
          });
          setUsername(userResponse.data.username);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };
    fetchPosts();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const response = await axios.post(
        `${API_URL}/posts`,
        { content },
        { headers: { Authorization: token } }
      );
      setPosts([response.data, ...posts]);
      setContent("");
    } catch (err) {
      console.error("Failed to post");
    }
  };

  const toggleLike = async (postId: string) => {
    if (!token) return;
    try {
      console.log("Sending like request for postId:", postId); // Лог для отладки
      const response = await axios.post(
        `${API_URL}/posts/${postId}/like`, // Исправлено: добавлено /posts/
        {},
        { headers: { Authorization: token } }
      );
      const { likes, likedBy } = response.data;
      setPosts(
        posts.map((post) =>
          post._id === postId ? { ...post, likes, likedBy } : post
        )
      );
    } catch (err: any) {
      console.error("Failed to like post:", err.response?.data, err.message);
    }
  };

  return (
    <div className={styles.feed}>
      <h2>Feed</h2>
      {token && (
        <div className={styles.postForm}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
          />
          <button onClick={handleSubmit}>Post</button>
        </div>
      )}
      <div className={styles.posts}>
        {/* если нет постов вывожу что их нет ;) */}
        {posts.length === 0 ? (
          <p className={styles.noPosts}>No posts yet</p>
        ) : (
          posts.map((post) => (
            <div key={post._id} className={styles.post}>
              {" "}
              {/* key={post._id} */}
              <p>
                <strong>{post.username}</strong> -{" "}
                {new Date(post.createdAt).toLocaleString()}
              </p>
              <p>{post.content}</p>
              <div className={styles.likes}>
                {token && (
                  <button
                    onClick={() => toggleLike(post._id)}
                    style={{
                      color: post.likedBy.includes(username) ? "red" : "black",
                    }}
                  >
                    {post.likedBy.includes(username) ? "Unlike" : "Like"}
                  </button>
                )}

                <div className={styles.tooltipWrapper}>
                  <span className={styles.likesCount}>
                    Likes: {post.likes || 0}
                  </span>
                  {post.likedBy.length > 0 && (
                    <div className={styles.tooltip}>
                      {post.likedBy.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;
