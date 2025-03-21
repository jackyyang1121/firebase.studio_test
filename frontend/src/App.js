import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Typography, Card } from '@mui/material';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [goal, setGoal] = useState('');
  const [question, setQuestion] = useState('');
  const [plan, setPlan] = useState([]);
  const [videos, setVideos] = useState([]);
  const [answer, setAnswer] = useState('');

  
  const backendUrl = 'https://friendly-invention-4jvw9w69jg74cq69-5000.app.github.dev'; 

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${backendUrl}/login`, { email, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
    } catch (error) {
      console.error('Login failed:', error);
      alert('登入失敗，請檢查後端是否運行');
    }
  };

  const getPlan = async () => {
    try {
      const res = await axios.post(`${backendUrl}/api/plan`, { goal }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlan(res.data.plan);
      setVideos(res.data.videos);
    } catch (error) {
      console.error('Get plan failed:', error);
    }
  };

  const askQuestion = async () => {
    try {
      const res = await axios.post(`${backendUrl}/api/ask`, { question }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnswer(res.data.answer);
    } catch (error) {
      console.error('Ask question failed:', error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4">AI 學習計畫生成器</Typography>

      {!token && (
        <div>
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="密碼" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button onClick={handleLogin}>登入</Button>
        </div>
      )}

      {token && (
        <>
          <TextField label="學習目標" value={goal} onChange={(e) => setGoal(e.target.value)} fullWidth />
          <Button variant="contained" onClick={getPlan} style={{ marginTop: 10 }}>生成計畫</Button>

          {plan.map((step, idx) => (
            <Typography key={idx}>{step}</Typography>
          ))}
          {videos.map(video => (
            <Card key={video.videoId} style={{ margin: '10px 0', padding: 10 }}>
              <Typography>{video.title}</Typography>
              <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer">觀看</a>
            </Card>
          ))}

          <TextField label="問問題" value={question} onChange={(e) => setQuestion(e.target.value)} fullWidth style={{ marginTop: 20 }} />
          <Button variant="contained" onClick={askQuestion} style={{ marginTop: 10 }}>問 AI</Button>
          <Typography>{answer}</Typography>
        </>
      )}
    </div>
  );
}

export default App;
