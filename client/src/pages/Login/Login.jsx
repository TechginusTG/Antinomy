import React, { useState } from 'react';
import styles from './Login.module.css';

const Login = ({ onLoginSuccess }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Login successful', data);
        localStorage.setItem('authToken', data.token);
        onLoginSuccess(); 
      } else {
        setError(data.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('Login request failed', err);
      setError('로그인 요청 중 오류가 발생했습니다. 서버가 실행 중인지 확인하세요.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <h2>Antinomy에 로그인</h2>
        <div className={styles.inputGroup}>
          <label htmlFor="id">Id</label>
          <input
            type="text"
            id="id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <button type="submit" className={styles.loginButton}>로그인</button>
      </form>
    </div>
  );
};

export default Login;
