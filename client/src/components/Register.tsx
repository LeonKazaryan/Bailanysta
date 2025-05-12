import { useState } from "react"; //для динамического изменения компонента
import axios from "axios";
import styles from "./Form.module.css";
import { useNavigate } from "react-router-dom"; // useNavigate для перенаправления
import { API_URL } from "../config";

interface RegisterProps {
  setToken: (token: string) => void;
}

const Register = ({ setToken }: RegisterProps) => {
  const navigate = useNavigate(); // Инициализируем хук для навигации
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    //async - может использовать await для ожидания ответа от бэка
    e.preventDefault(); //чтобы форма по умолчанию не двигалась
    // Проверяем совпадение паролей перед отправкой
    if (password !== passwordRepeat) {
      setError("Passwords do not match");
      return; // Прерываем выполнение, если пароли не совпадают
    }
    try {
      await axios.post(`${API_URL}/register`, {
        username,
        password,
      });
      //вход в систему сразу после регистрации
      const response = await axios.post(`${API_URL}/login`, {
        //response - ответ сервера
        username,
        password,
      });
      const token = response.data.token; //извлечает токен из ответа
      localStorage.setItem("token", token);
      //хранилище браузера, нужно чтобы сохранять пользователя после перезагрузки
      setToken(token); //нужно чтобы форнт знал что пользователь авторизован
      // Перенаправляем на страницу профиля
      navigate("/profile");
    } catch (err) {
      setError("Registration failed");
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Register</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="username" className={styles.label}>
            Username
          </label>
          <input
            type="text"
            id="username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="passwordRepeat" className={styles.label}>
            Repeat Password
          </label>
          <input
            type="password"
            id="passwordRepeat"
            placeholder="Enter password again"
            value={passwordRepeat}
            onChange={(e) => setPasswordRepeat(e.target.value)}
            className={styles.input}
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
