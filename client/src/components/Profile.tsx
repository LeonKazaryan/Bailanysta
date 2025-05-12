import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Profile.module.css";
import { API_URL } from "../config";

interface Post {
  _id: string;
  username: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
}

interface ProfileProps {
  token: string | null;
}

const Profile = ({ token }: ProfileProps) => {
  const [username, setUsername] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");

  const deletePost = async (postId: string) => {
    if (!token) return;
    try {
      await axios.delete(`${API_URL}/posts/${postId}`, {
        headers: { Authorization: token },
      });

      // Обновление постов
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete post");
    }
  };

  const toggleLike = async (postId: string) => {
    if (!token) return;
    try {
      // console.log("Sending like request for postId:", postId);
      const response = await axios.post(
        `${API_URL}/posts/${postId}/like`,
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
      console.error("Failed to like post:", err.response?.data || err.message);
    }
  };

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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const userResponse = await axios.get(`${API_URL}/me`, {
          headers: { Authorization: token },
        });
        const username = userResponse.data.username;
        setUsername(username);

        const postsResponse = await axios.get(`${API_URL}/posts/${username}`);
        setPosts(postsResponse.data);
      } catch (err) {
        console.error("Failed to fetch profile");
      }
    };
    fetchProfile();
  }, [token]);

  if (!token) return <p>Please log in to view your profile.</p>;

  return (
    <div className={styles.profile}>
      <h2>{username}'s Profile</h2>

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
        {posts.map((post) => (
          <div key={post._id} className={styles.post}>
            {" "}
            {}
            <p>{new Date(post.createdAt).toLocaleString()}</p>
            <p>{post.content}</p>
            <div className={styles.likes}>
              <button
                onClick={() => toggleLike(post._id)}
                style={{
                  color: post.likedBy.includes(username) ? "red" : "black",
                }}
              >
                {post.likedBy.includes(username) ? "Unlike" : "Like"}
              </button>

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
            <button onClick={() => deletePost(post._id)}>delete</button> {}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
