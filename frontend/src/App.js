import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion'; // 引入動畫庫
import './App.css';

const RegisterForm = ({ username, setUsername, password, setPassword, register, loading, error }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
    <Card className="mb-4 tech-card">
      <Card.Header className="tech-header">註冊</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group controlId="registerUsername" className="mb-3">
            <Form.Label>用戶名</Form.Label>
            <Form.Control
              type="text"
              placeholder="輸入用戶名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="tech-input"
            />
          </Form.Group>
          <Form.Group controlId="registerPassword" className="mb-3">
            <Form.Label>密碼</Form.Label>
            <Form.Control
              type="password"
              placeholder="輸入密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="tech-input"
            />
          </Form.Group>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn tech-btn"
            onClick={register}
            disabled={loading}
          >
            {loading ? <Spinner as="span" animation="border" size="sm" /> : '註冊'}
          </motion.button>
          {error && <Alert variant="danger" className="mt-3 tech-alert">{error}</Alert>}
        </Form>
      </Card.Body>
    </Card>
  </motion.div>
);

const LoginForm = ({ username, setUsername, password, setPassword, login, logout, checkLogin, loading, error }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
    <Card className="mb-4 tech-card">
      <Card.Header className="tech-header">登入</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group controlId="loginUsername" className="mb-3">
            <Form.Label>用戶名</Form.Label>
            <Form.Control
              type="text"
              placeholder="輸入用戶名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="tech-input"
            />
          </Form.Group>
          <Form.Group controlId="loginPassword" className="mb-3">
            <Form.Label>密碼</Form.Label>
            <Form.Control
              type="password"
              placeholder="輸入密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="tech-input"
            />
          </Form.Group>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn tech-btn me-2"
            onClick={login}
            disabled={loading}
          >
            {loading ? <Spinner as="span" animation="border" size="sm" /> : '登入'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn tech-btn-secondary me-2"
            onClick={logout}
            disabled={loading}
          >
            登出
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn tech-btn-info"
            onClick={checkLogin}
            disabled={loading}
          >
            檢查登入狀態
          </motion.button>
          {error && <Alert variant="danger" className="mt-3 tech-alert">{error}</Alert>}
        </Form>
      </Card.Body>
    </Card>
  </motion.div>
);

const PlanGenerator = ({ goal, setGoal, generatePlan, plan, loading, error }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
    <Card className="mb-4 tech-card">
      <Card.Header className="tech-header">生成學習計畫</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group controlId="goal" className="mb-3">
            <Form.Label>學習目標</Form.Label>
            <Form.Control
              type="text"
              placeholder="輸入學習目標"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="tech-input"
            />
          </Form.Group>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn tech-btn"
            onClick={generatePlan}
            disabled={loading}
          >
            {loading ? <Spinner as="span" animation="border" size="sm" /> : '生成計畫'}
          </motion.button>
          {plan && <Card.Text className="mt-3 tech-text">{plan}</Card.Text>}
          {error && <Alert variant="danger" className="mt-3 tech-alert">{error}</Alert>}
        </Form>
      </Card.Body>
    </Card>
  </motion.div>
);

const LearningProgress = ({ progress, getProgress, loading, error }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
    <Card className="mb-4 tech-card">
      <Card.Header className="tech-header">
        學習進度
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn tech-btn-outline float-end"
          onClick={getProgress}
          disabled={loading}
        >
          {loading ? <Spinner as="span" animation="border" size="sm" /> : '刷新'}
        </motion.button>
      </Card.Header>
      <ListGroup variant="flush">
        {progress.length > 0 ? (
          progress.map((item, index) => (
            <ListGroup.Item key={index} className="tech-list-item">
              <h5>{item.goal}</h5>
              <p>{item.plan}</p>
              <small className="text-muted">創建時間: {item.created_at}</small>
            </ListGroup.Item>
          ))
        ) : (
          <ListGroup.Item className="tech-list-item">尚無進度記錄</ListGroup.Item>
        )}
      </ListGroup>
      {error && <Alert variant="danger" className="m-3 tech-alert">{error}</Alert>}
    </Card>
  </motion.div>
);

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [goal, setGoal] = useState('');
  const [plan, setPlan] = useState('');
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const backendUrl = 'https://ai-learning-assistant-30563387234.asia-east1.run.app';

  const register = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`${backendUrl}/register`, { username, password }, { withCredentials: true });
      alert('註冊成功');
    } catch (error) {
      setError(error.response?.data?.message || '註冊失敗');
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`${backendUrl}/login`, { username, password }, { withCredentials: true });
      alert('登入成功');
    } catch (error) {
      setError(error.response?.data?.message || '登入失敗');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`${backendUrl}/logout`, {}, { withCredentials: true });
      alert('登出成功');
    } catch (error) {
      setError(error.response?.data?.message || '登出失敗');
    } finally {
      setLoading(false);
    }
  };

  const checkLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${backendUrl}/check_login`, { withCredentials: true });
      alert(response.data.message);
    } catch (error) {
      setError(error.response?.data?.message || '未登入');
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${backendUrl}/generate_plan`, { goal }, { withCredentials: true });
      setPlan(response.data.plan);
      alert('生成計畫成功');
    } catch (error) {
      setError(error.response?.data?.message || '生成計畫失敗');
    } finally {
      setLoading(false);
    }
  };

  const getProgress = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${backendUrl}/learning_progress`, { withCredentials: true });
      setProgress(response.data);
    } catch (error) {
      setError(error.response?.data?.message || '獲取進度失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tech-background">
      <Container className="py-5">
        <motion.h1
          className="text-center mb-5 tech-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          AI 學習助手
        </motion.h1>
        <Row>
          <Col md={6}>
            <RegisterForm
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              register={register}
              loading={loading}
              error={error}
            />
          </Col>
          <Col md={6}>
            <LoginForm
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              login={login}
              logout={logout}
              checkLogin={checkLogin}
              loading={loading}
              error={error}
            />
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <PlanGenerator
              goal={goal}
              setGoal={setGoal}
              generatePlan={generatePlan}
              plan={plan}
              loading={loading}
              error={error}
            />
          </Col>
          <Col md={6}>
            <LearningProgress
              progress={progress}
              getProgress={getProgress}
              loading={loading}
              error={error}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default App;