import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
    Container, Row, Col, Card, Form, Button, Spinner, Alert, ListGroup
} from 'react-bootstrap';

// --- Configuration ---
const backendUrl = 'https://ai-learning-assistant-30563387234.asia-east1.run.app';
const backgroundImageUrl = '/background.png';

// --- Axios Instance ---
const apiClient = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
});

// --- Helper Components ---
const LoadingSpinner = ({ size = 'sm', className = '' }) => (
    <Spinner animation="border" size={size} role="status" className={className}>
        <span className="visually-hidden">載入中...</span>
    </Spinner>
);

// --- Authentication Components ---
const AuthForm = ({ title, fields, submitAction, submitText, loading, switchFormAction, switchFormText }) => {
    const [formData, setFormData] = useState(() =>
        fields.reduce((acc, field) => {
            acc[field.id] = '';
            return acc;
        }, {})
    );

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        submitAction(formData);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-100"
        >
            <Card className="custom-card w-100 mx-auto" style={{ maxWidth: '450px' }}>
                <Card.Header as="h5" className="text-center">{title}</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        {fields.map((field) => (
                            <Form.Group className="mb-3" controlId={field.id} key={field.id}>
                                <Form.Label>{field.label}</Form.Label>
                                <Form.Control
                                    type={field.type || 'text'}
                                    placeholder={field.placeholder}
                                    value={formData[field.id]}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                />
                            </Form.Group>
                        ))}
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
                            className="w-100 mt-2"
                        >
                            {loading ? <LoadingSpinner size="sm" /> : submitText}
                        </Button>
                    </Form>
                    <div className="mt-3 text-center">
                        <Button
                            variant="link"
                            onClick={switchFormAction}
                            disabled={loading}
                            size="sm"
                        >
                            {switchFormText}
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </motion.div>
    );
};

// --- Dashboard Components ---
const PlanGenerator = ({ generatePlan, loading }) => {
    const [formData, setFormData] = useState({
        goal: '',
        weeklyTime: 5,
        experienceLevel: '初學者',
        learningStyle: '視覺型',
        motivation: '職業發展',
        resourcePreference: '線上課程',
        languagePreference: '中文',
        learningPace: '穩步前進'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerate = () => {
        if (!formData.goal.trim()) {
            toast.error('請輸入學習目標');
            return;
        }
        generatePlan(formData);
    };

    return (
        <Card className="custom-card mb-4 h-100">
            <Card.Header>生成個人化學習計畫</Card.Header>
            <Card.Body className="d-flex flex-column">
                <Form>
                    <Form.Group className="mb-3" controlId="goal">
                        <Form.Label>學習目標</Form.Label>
                        <Form.Control
                            type="text"
                            name="goal"
                            placeholder="例如：學習 Python、提升英語口說、掌握影片剪輯"
                            value={formData.goal}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="weeklyTime">
                        <Form.Label>每周可用學習時間（小時）</Form.Label>
                        <Form.Control
                            type="number"
                            name="weeklyTime"
                            min="1"
                            placeholder="輸入每周可投入的學習小時數"
                            value={formData.weeklyTime}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="experienceLevel">
                        <Form.Label>經驗水平</Form.Label>
                        <Form.Select
                            name="experienceLevel"
                            value={formData.experienceLevel}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="初學者">初學者</option>
                            <option value="中級">中級</option>
                            <option value="進階">進階</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="learningStyle">
                        <Form.Label>學習風格</Form.Label>
                        <Form.Select
                            name="learningStyle"
                            value={formData.learningStyle}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="視覺型">視覺型（喜歡圖表、影片）</option>
                            <option value="聽覺型">聽覺型（喜歡講座、播客）</option>
                            <option value="動手實作型">動手實作型（喜歡實操、練習）</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="motivation">
                        <Form.Label>學習動機</Form.Label>
                        <Form.Select
                            name="motivation"
                            value={formData.motivation}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="職業發展">職業發展</option>
                            <option value="興趣愛好">興趣愛好</option>
                            <option value="學術研究">學術研究</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="resourcePreference">
                        <Form.Label>資源偏好</Form.Label>
                        <Form.Select
                            name="resourcePreference"
                            value={formData.resourcePreference}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="線上課程">線上課程</option>
                            <option value="書籍">書籍</option>
                            <option value="影片教學">影片教學</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="languagePreference">
                        <Form.Label>語言偏好</Form.Label>
                        <Form.Select
                            name="languagePreference"
                            value={formData.languagePreference}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="中文">中文</option>
                            <option value="英文">英文</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="learningPace">
                        <Form.Label>學習節奏</Form.Label>
                        <Form.Select
                            name="learningPace"
                            value={formData.learningPace}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="快速掌握">快速掌握</option>
                            <option value="穩步前進">穩步前進</option>
                            <option value="深入學習">深入學習</option>
                        </Form.Select>
                    </Form.Group>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="info"
                            onClick={handleGenerate}
                            disabled={loading}
                            className="mt-3 w-100 gradient-button"
                        >
                            {loading ? <LoadingSpinner size="sm" /> : '生成計畫'}
                        </Button>
                    </motion.div>
                </Form>
            </Card.Body>
        </Card>
    );
};

const LearningProgress = ({ progress, getProgress, loading, plan }) => (
    <Card className="custom-card mb-4 h-100">
        <Card.Header>
            學習進度 & 最新計畫
            <Button
                variant="outline-secondary"
                size="sm"
                className="float-end"
                onClick={getProgress}
                disabled={loading}
            >
                {loading ? <LoadingSpinner size="sm" /> : '刷新'}
            </Button>
        </Card.Header>
        <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {plan && (
                <motion.div
                    className="latest-plan-section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h4>最新生成的計畫:</h4>
                    <p className="text-light small whitespace-pre-wrap">{plan}</p>
                </motion.div>
            )}
            <div className="progress-history-section">
                <h4>學習歷史記錄:</h4>
                {loading && progress.length === 0 && <div className="text-center p-3"><LoadingSpinner /></div>}
                {!loading && progress.length === 0 && !plan && (
                    <Alert variant="secondary" className="text-center small">尚無進度記錄。</Alert>
                )}
                {progress.length > 0 && (
                    <ListGroup variant="flush">
                        {progress.map((item, index) => (
                            <motion.div
                                key={item.id || index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <ListGroup.Item className="custom-list-item">
                                    <div className="fw-bold">{item.goal}</div>
                                    <p className="mb-1 small whitespace-pre-wrap">{item.plan}</p>
                                    <small className="text-muted">
                                        創建時間: {new Date(item.created_at).toLocaleString()}
                                    </small>
                                </ListGroup.Item>
                            </motion.div>
                        ))}
                    </ListGroup>
                )}
            </div>
        </Card.Body>
    </Card>
);

// --- Main Page Components ---
const LoginPage = ({ setView, handleLogin, loading }) => (
    <AuthForm
        title="登入"
        fields={[
            { id: 'username', label: '用戶名', placeholder: '輸入用戶名' },
            { id: 'password', label: '密碼', type: 'password', placeholder: '輸入密碼' }
        ]}
        submitAction={handleLogin}
        submitText="登入"
        loading={loading}
        switchFormAction={() => setView('register')}
        switchFormText="還沒有帳號？ 前往註冊"
    />
);

const RegisterPage = ({ setView, handleRegister, loading }) => (
    <AuthForm
        title="註冊"
        fields={[
            { id: 'username', label: '用戶名', placeholder: '設定用戶名' },
            { id: 'password', label: '密碼', type: 'password', placeholder: '設定密碼' }
        ]}
        submitAction={handleRegister}
        submitText="註冊"
        loading={loading}
        switchFormAction={() => setView('login')}
        switchFormText="已經有帳號？ 前往登入"
    />
);

const DashboardPage = ({ handleLogout, generatePlan, getProgress, progress, plan, loading, authLoading }) => (
    <Container fluid>
        <Row className="mb-4 align-items-center">
            <Col>
                <h1 className="main-title h3">學習儀表板</h1>
            </Col>
            <Col xs="auto">
                <Button
                    variant="outline-light"
                    onClick={handleLogout}
                    disabled={authLoading}
                >
                    {authLoading ? <LoadingSpinner size="sm" /> : '登出'}
                </Button>
            </Col>
        </Row>
        <Row>
            <Col md={6} className="mb-4 mb-md-0">
                <PlanGenerator generatePlan={generatePlan} loading={loading} />
            </Col>
            <Col md={6}>
                <LearningProgress progress={progress} getProgress={getProgress} loading={loading} plan={plan} />
            </Col>
        </Row>
    </Container>
);

// --- App Component ---
const App = () => {
    const [view, setView] = useState('login');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [plan, setPlan] = useState('');
    const [progress, setProgress] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);

    const handleApiCall = async (apiFunc, setLoadingFunc, successMessage, errorMessagePrefix) => {
        setLoadingFunc(true);
        try {
            const response = await apiFunc();
            if (successMessage) toast.success(successMessage);
            return response;
        } catch (error) {
            const message = error.response?.data?.message || error.message || `${errorMessagePrefix}失敗`;
            if (!message.toLowerCase().includes('cors')) {
                toast.error(message);
            }
            console.error(errorMessagePrefix, error);
            if (error.message.toLowerCase().includes('network error') || error.message.toLowerCase().includes('failed to fetch') || (error.response && error.response.status === 0)) {
                console.warn("偵測到網路或 CORS 相關錯誤。請檢查後端 CORS 設定是否允許來自 " + window.location.origin + " 的請求。");
            }
            return null;
        } finally {
            setLoadingFunc(false);
        }
    };

    const handleRegister = async ({ username, password }) => {
        if (!username.trim() || !password.trim()) {
            toast.error('用戶名和密碼不能為空');
            return;
        }
        const success = await handleApiCall(
            () => apiClient.post('/register', { username, password }),
            setAuthLoading,
            '註冊成功！請登入。',
            '註冊'
        );
        if (success) {
            setView('login');
        }
    };

    const handleLogin = async ({ username, password }) => {
        if (!username.trim() || !password.trim()) {
            toast.error('用戶名和密碼不能為空');
            return;
        }
        const response = await handleApiCall(
            () => apiClient.post('/login', { username, password }),
            setAuthLoading,
            '登入成功！',
            '登入'
        );
        if (response) {
            setIsLoggedIn(true);
            setView('dashboard');
            await getProgress(false);
        }
    };

    const handleLogout = async () => {
        const success = await handleApiCall(
            () => apiClient.post('/logout'),
            setAuthLoading,
            '登出成功！',
            '登出'
        );
        if (success) {
            setIsLoggedIn(false);
            setView('login');
            setPlan('');
            setProgress([]);
        }
    };

    const generatePlan = async (formData) => {
        const response = await handleApiCall(
            () => apiClient.post('/generate_plan', formData),
            setDataLoading,
            '學習計畫生成成功！',
            '生成計畫'
        );
        if (response) {
            setPlan(response.data.plan);
            await getProgress(false);
        }
    };

    const getProgress = useCallback(async (setLoad = true) => {
        if (setLoad) setDataLoading(true);
        try {
            const response = await apiClient.get('/learning_progress');
            setProgress(response.data || []);
        } catch (error) {
            const message = error.response?.data?.message || error.message || '獲取進度失敗';
            if (setLoad && !message.toLowerCase().includes('cors')) {
                toast.error(message);
            }
            console.error('獲取進度', error);
            if (error.message.toLowerCase().includes('network error') || error.message.toLowerCase().includes('failed to fetch') || (error.response && error.response.status === 0)) {
                console.warn("獲取進度時偵測到網路或 CORS 相關錯誤。請檢查後端 CORS 設定。");
            }
            setProgress([]);
        } finally {
            if (setLoad) setDataLoading(false);
        }
    }, []);

    const checkLoginStatus = useCallback(async () => {
        setInitialLoading(true);
        try {
            await apiClient.get('/check_login');
            setIsLoggedIn(true);
            setView('dashboard');
            await getProgress(false);
        } catch (error) {
            setIsLoggedIn(false);
            setView('login');
            console.log("checkLoginStatus 失敗: 尚未登入或 Session 過期 / CORS 問題");
            if (error.message.toLowerCase().includes('network error') || error.message.toLowerCase().includes('failed to fetch') || (error.response && error.response.status === 0)) {
                console.warn("檢查登入狀態時偵測到網路或 CORS 相關錯誤。請檢查後端 CORS 設定。");
            }
        } finally {
            setInitialLoading(false);
        }
    }, [getProgress]);

    useEffect(() => {
        checkLoginStatus();
    }, [checkLoginStatus]);

    const renderView = () => {
        if (initialLoading) {
            return (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                    <LoadingSpinner size="lg" />
                </div>
            );
        }
        switch (view) {
            case 'register':
                return <RegisterPage setView={setView} handleRegister={handleRegister} loading={authLoading} />;
            case 'dashboard':
                return isLoggedIn ? (
                    <DashboardPage
                        handleLogout={handleLogout}
                        generatePlan={generatePlan}
                        getProgress={getProgress}
                        progress={progress}
                        plan={plan}
                        loading={dataLoading}
                        authLoading={authLoading}
                    />
                ) : (
                    <LoginPage setView={setView} handleLogin={handleLogin} loading={authLoading} />
                );
            case 'login':
            default:
                return <LoginPage setView={setView} handleLogin={handleLogin} loading={authLoading} />;
        }
    };

    return (
        <div
            className="app-container"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    className: '',
                    style: {
                        background: '#333',
                        color: '#fff',
                        zIndex: 9999,
                    },
                    duration: 4000,
                }}
            />
            <div className="content-wrapper">
                <motion.h1
                    className="main-title text-center mb-4 h2"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    AI 個人化學習助手
                </motion.h1>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                        className="motion-div-wrapper"
                    >
                        {renderView()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default App;