import { Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import Register from "./components/Register";
import Login from "./components/Login";
import Feed from "./components/Feed";
import Profile from "./components/Profile";
import styles from "./App.module.css";

const App = () => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.title}>Bailanysta</div>
        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>
            Feed
          </Link>
          {token ? (
            <>
              <Link to="/profile" className={styles.navLink}>
                Profile
              </Link>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className={styles.navLink}>
                Register
              </Link>
              <Link to="/login" className={styles.navLink}>
                Login
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Feed token={token} />} />
          <Route path="/register" element={<Register setToken={setToken} />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/profile" element={<Profile token={token} />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
