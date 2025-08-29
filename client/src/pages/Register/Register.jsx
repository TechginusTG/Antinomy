import React, { useState } from 'react';
import styles from './Register.module.css';

const Register = ({ onRegistrationSuccess, switchToLogin }) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, name, password }),
      });

      const data = await response.json();

      if (response.status === 201 && data.success) {
        alert('회원가입이 성공적으로 완료되었습니다. 로그인 페이지로 이동합니다.');
        switchToLogin(); 
      } else {
        setError(data.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      console.error('Registration request failed', err);
      setError('회원가입 요청 중 오류가 발생했습니다. 서버가 실행 중인지 확인하세요.');
    }
  };

  return (
    <div className={styles.registerContainer}>
      <form onSubmit={handleSubmit} className={styles.registerForm}>
        <h2>Antinomy 계정 생성</h2>
        <div className={styles.inputGroup}>
          <label htmlFor="name">User Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
        <button type="submit" className={styles.registerButton}>계정 생성하기</button>
        <p className={styles.switchText}>
          이미 계정이 있으신가요? <span onClick={switchToLogin} className={styles.switchLink}>로그인</span>
        </p>
      </form>
    </div>
  );
};

export default Register;
