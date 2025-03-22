import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [goal, setGoal] = useState('');
  const [plan, setPlan] = useState('');
  const [progress, setProgress] = useState([]);
  const backendUrl = 'https://friendly-invention-4jvw9w69jg74cq69-5000.app.github.dev/';

  const register = async () => {
    console.log('Register data:', { username, password });
    try {
      await axios.post(`${backendUrl}/register`, { username, password }, { withCredentials: true });
      alert('註冊成功');
    } catch (error) {
      console.error('Register error:', error.message, error.response?.data);
      alert(`註冊失敗: ${error.message}`);
    }
  };

  const login = async () => {
    console.log('Login data:', { username, password });
    try {
      await axios.post(`${backendUrl}/login`, { username, password }, { withCredentials: true });
      alert('登入成功');
    } catch (error) {
      console.error('Login error:', error.message, error.response?.data);
      alert(`登入失敗: ${error.message}`);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${backendUrl}/logout`, {}, { withCredentials: true });
      alert('登出成功');
    } catch (error) {
      console.error('Logout error:', error.message, error.response?.data);
      alert(`登出失敗: ${error.message}`);
    }
  };

  const generatePlan = async () => {
    console.log('Generate plan data:', { goal }); // 新增日誌
    try {
      const response = await axios.post(`${backendUrl}/generate_plan`, { goal }, { withCredentials: true });
      setPlan(response.data.plan);
      alert('生成計畫成功');
    } catch (error) {
      console.error('Generate plan error:', error.message, error.response?.data);
      alert(`生成計畫失敗: ${error.message}`);
    }
  };

  const getProgress = async () => {
    try {
      const response = await axios.get(`${backendUrl}/learning_progress`, { withCredentials: true });
      setProgress(response.data);
    } catch (error) {
      console.error('Get progress error:', error.message, error.response?.data);
      alert(`獲取進度失敗: ${error.message}`);
    }
  };

  const checkLogin = async () => {
    try {
      const response = await axios.get(`${backendUrl}/check_login`, { withCredentials: true });
      alert(response.data.message);
    } catch (error) {
      console.error('Check login error:', error.message, error.response?.data);
      alert(`未登入: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>AI 學習助手</h1>
      <input type="text" placeholder="用戶名" onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="密碼" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={register}>註冊</button>
      <button onClick={login}>登入</button>
      <button onClick={logout}>登出</button>
      <button onClick={checkLogin}>檢查登入狀態</button>
      <input type="text" placeholder="學習目標" onChange={(e) => setGoal(e.target.value)} />
      <button onClick={generatePlan}>生成計畫</button>
      <button onClick={getProgress}>查看進度</button>
      <div>
        <h2>學習計畫</h2>
        <p>{plan}</p>
      </div>
      <div>
        <h2>學習進度</h2>
        {progress.map((item, index) => (
          <div key={index}>
            <p>目標：{item.goal}</p>
            <p>計畫：{item.plan}</p>
            <p>創建時間：{item.created_at}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;