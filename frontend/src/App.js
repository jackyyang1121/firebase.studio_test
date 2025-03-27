import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, ListGroup, Spinner, Alert } from 'react-bootstrap';
import './App.css'; // 稍後會提供樣式文件

// 註冊表單組件
const RegisterForm = ({ username, setUsername, password, setPassword, register, loading, error }) => (
  <Card className="mb-4 shadow-sm">
    <Card.Header>註冊</Card.Header>
    <Card.Body>
      <Form>
        <Form.Group controlId="registerUsername" className="mb-3">
          <Form.Label>用戶名</Form.Label>
          <Form.Control
            type="text"
            placeholder="輸入用戶名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="registerPassword" className="mb-3">
          <Form.Label>密碼</Form.Label>
          <Form.Control
            type="password"
            placeholder="輸入密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" onClick={register} disabled={loading}>
          {loading ? <Spinner as="span" animation="border" size="sm" /> : '註冊'}
        </Button>
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      </Form>
    </Card.Body>
  </Card>
);

// 登入表單組件
const LoginForm = ({ username, setUsername, password, setPassword, login, logout, checkLogin, loading, error }) => (
  <Card className="mb-4 shadow-sm">
    <Card.Header>登入</Card.Header>
    <Card.Body>
      <Form>
        <Form.Group controlId="loginUsername" className="mb-3">
          <Form.Label>用戶名</Form.Label>
          <Form.Control
            type="text"
            placeholder="輸入用戶名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="loginPassword" className="mb-3">
          <Form.Label>密碼</Form.Label>
          <Form.Control
            type="password"
            placeholder="輸入密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button variant="success" onClick={login} disabled={loading} className="me-2">
          {loading ? <Spinner as="span" animation="border" size="sm" /> : '登入'}
        </Button>
        <Button variant="secondary" onClick={logout} disabled={loading} className="me-2">
          登出
        </Button>
        <Button variant="info" onClick={checkLogin} disabled={loading}>
          檢查登入狀態
        </Button>
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      </Form>
    </Card.Body>
  </Card>
);

// 學習計畫生成組件
const PlanGenerator = ({ goal, setGoal, generatePlan, plan, loading, error }) => (
  <Card className="mb-4 shadow-sm">
    <Card.Header>生成學習計畫</Card.Header>
    <Card.Body>
      <Form>
        <Form.Group controlId="goal" className="mb-3">
          <Form.Label>學習目標</Form.Label>
          <Form.Control
            type="text"
            placeholder="輸入學習目標"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" onClick={generatePlan} disabled={loading}>
          {loading ? <Spinner as="span" animation="border" size="sm" /> : '生成計畫'}
        </Button>
        {plan && <Card.Text className="mt-3">{plan}</Card.Text>}
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      </Form>
    </Card.Body>
  </Card>
);

// 學習進度展示組件
const LearningProgress = ({ progress, getProgress, loading, error }) => (
  <Card className="mb-4 shadow-sm">
    <Card.Header>
      學習進度
      <Button variant="outline-primary" size="sm" onClick={getProgress} disabled={loading} className="float-end">
        {loading ? <Spinner as="span" animation="border" size="sm" /> : '刷新'}
      </Button>
    </Card.Header>
    <ListGroup variant="flush">
      {progress.length > 0 ? (
        progress.map((item, index) => (
          <ListGroup.Item key={index}>
            <h5>{item.goal}</h5>
            <p>{item.plan}</p>
            <small className="text-muted">創建時間: {item.created_at}</small>
          </ListGroup.Item>
        ))
      ) : (
        <ListGroup.Item>尚無進度記錄</ListGroup.Item>
      )}
    </ListGroup>
    {error && <Alert variant="danger" className="m-3">{error}</Alert>}
  </Card>
);

// 主應用組件
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
    <Container className="py-5">
      <h1 className="text-center mb-4">AI 學習助手</h1>
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
  );
};

export default App;