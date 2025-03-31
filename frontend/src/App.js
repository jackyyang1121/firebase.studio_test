import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Card, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import './App.css';
import backgroundImage from './assets/background.jpg'; // 引入背景圖片

const backendUrl = 'https://ai-learning-assistant-30563387234.asia-east1.run.app';

// 註冊表單組件
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
                            disabled={loading}
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
                            disabled={loading}
                        />
                    </Form.Group>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(0, 180, 219, 0.5)' }}
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

// 登入表單組件
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
                            disabled={loading}
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
                            disabled={loading}
                        />
                    </Form.Group>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(0, 180, 219, 0.5)' }}
                        whileTap={{ scale: 0.95 }}
                        className="btn tech-btn me-2"
                        onClick={login}
                        disabled={loading}
                    >
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : '登入'}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(107, 114, 128, 0.5)' }}
                        whileTap={{ scale: 0.95 }}
                        className="btn tech-btn-secondary me-2"
                        onClick={logout}
                        disabled={loading}
                    >
                        登出
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(14, 165, 233, 0.5)' }}
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

// 學習計畫生成組件
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
                            placeholder="輸入學習目標 (例如：學習 Python 基礎)"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="tech-input"
                            disabled={loading}
                        />
                    </Form.Group>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(0, 180, 219, 0.5)' }}
                        whileTap={{ scale: 0.95 }}
                        className="btn tech-btn"
                        onClick={generatePlan}
                        disabled={loading}
                    >
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : '生成計畫'}
                    </motion.button>
                    {plan && (
                        <motion.div
                            className="mt-3 tech-plan"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <p>以下是為你建立的學習計畫:</p> {/* 添加前綴訊息 */}
                            {plan}
                        </motion.div>
                    )}
                    {error && <Alert variant="danger" className="mt-3 tech-alert">{error}</Alert>}
                </Form>
            </Card.Body>
        </Card>
    </motion.div>
);

// 學習進度展示組件
const LearningProgress = ({ progress, getProgress, loading, error }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <Card className="mb-4 tech-card">
            <Card.Header className="tech-header">
                學習進度
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(0, 180, 219, 0.5)' }}
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
                        <motion.div
                            key={index}
                            className="tech-list-item"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <h5>{item.goal}</h5>
                            <p>{item.plan}</p>
                            <small className="text-muted">創建時間: {item.created_at}</small>
                        </motion.div>
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

    const register = async () => {
        setLoading(true);
        setError('');
        if (!username.trim() || !password.trim()) {
            setError('用戶名和密碼不能為空');
            setLoading(false);
            return;
        }
        try {
            await axios.post(`${backendUrl}/register`, { username, password }, { withCredentials: true });
            alert('註冊成功');
            setUsername('');
            setPassword('');
        } catch (error) {
            setError(error.response?.data?.message || '註冊失敗');
        } finally {
            setLoading(false);
        }
    };

    const login = async () => {
        setLoading(true);
        setError('');
        if (!username.trim() || !password.trim()) {
            setError('用戶名和密碼不能為空');
            setLoading(false);
            return;
        }
        try {
            await axios.post(`${backendUrl}/login`, { username, password }, { withCredentials: true });
            alert('登入成功');
            setUsername('');
            setPassword('');
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
            setPlan('');
            setProgress([]);
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
        const trimmedGoal = goal.trim();
        if (!trimmedGoal) {
            setError('請輸入學習目標');
            setLoading(false);
            return;
        }
        try {
            const response = await axios.post(
                `${backendUrl}/generate_plan`,
                { goal: trimmedGoal },
                { withCredentials: true }
            );
            setPlan(response.data.plan);
            alert('生成計畫成功');
            setGoal(''); // 清空輸入框
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
        <div className="tech-background" style={{ backgroundImage: `url(${backgroundImage})` }}>
            <Container className="py-5 position-relative">
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