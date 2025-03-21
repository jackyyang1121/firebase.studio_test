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

  const handleLogin = async () => {
    const res = await axios.post('http://localhost:5000/login', { email, password });
    setToken(res.data.token);
    localStorage.setItem('token', res.data.token);
  };

  const getPlan = async () => {
    const res = await axios.post('http://localhost:5000/api/plan', { goal }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPlan(res.data.plan);
    setVideos(res.data.videos);
  };

  const askQuestion = async () => {
    const res = await axios.post('http://localhost:5000/api/ask', { question }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAnswer(res.data.answer);
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4">AI 學習計畫生成器</Typography>

      {/* 登入 */}
      {!token && (
        <div>
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="密碼" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button onClick={handleLogin}>登入</Button>
        </div>
      )}

      {/* 主功能 */}
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
