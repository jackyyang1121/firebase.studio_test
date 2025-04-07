import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
    Container, Row, Col, Card, Form, Button, Spinner, Alert, ListGroup, Accordion, Badge
} from 'react-bootstrap';
import './App.css';

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
        specificGoal: '',  // 保留「具體目標」欄位
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
        if (!formData.goal.trim() || !formData.specificGoal.trim()) {
            toast.error('請輸入學習目標和具體目標');
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
                    <Form.Group className="mb-3" controlId="specificGoal">
                        <Form.Label>具體目標</Form.Label>
                        <Form.Control
                            type="text"
                            name="specificGoal"
                            placeholder="例如：開發 app、能跟母語者交流、能剪輯出高品質影片"
                            value={formData.specificGoal}
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
                    <Button
                        variant="info"
                        onClick={handleGenerate}
                        disabled={loading}
                        className="mt-3 w-100 gradient-button"
                    >
                        {loading ? <LoadingSpinner size="sm" /> : '生成計畫'}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

// --- LecturePage Component ---
const LecturePage = ({ planId, planContent, setView }) => {
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(false);
    const sections = planContent.match(/步驟 \d+：.*?$/gm) || [];

    useEffect(() => {
        const fetchLectures = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`/lectures/${planId}`);
                setLectures(response.data);
            } catch (error) {
                toast.error('獲取講義失敗');
            } finally {
                setLoading(false);
            }
        };
        fetchLectures();
    }, [planId]);

    const handleGenerateLecture = async (section) => {
        setLoading(true);
        try {
            const response = await apiClient.post('/generate_lecture', { plan_id: planId, section });
            setLectures([...lectures, { section, content: response.data.lecture, completed: false }]);
        } catch (error) {
            toast.error('生成講義失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteLecture = async (lectureId) => {
        try {
            await apiClient.post('/complete_lecture', { lecture_id: lectureId });
            setLectures(lectures.map(l => l.id === lectureId ? { ...l, completed: true } : l));
            toast.success('講義已標記為完成');
        } catch (error) {
            toast.error('標記失敗');
        }
    };

    return (
        <Container fluid>
            <Row className="mb-4 align-items-center">
                <Col>
                    <h1 className="main-title h3">學習講義</h1>
                </Col>
                <Col xs="auto">
                    <Button variant="outline-light" onClick={() => setView('dashboard')}>
                        返回儀表板
                    </Button>
                </Col>
            </Row>
            <Card className="custom-card">
                <Card.Header>
                    講義列表{' '}
                    <Badge bg="success">{lectures.filter(l => l.completed).length}/{lectures.length} 已完成</Badge>
                </Card.Header>
                <Card.Body>
                    <Accordion>
                        {sections.map((section, index) => {
                            const lecture = lectures.find(lec => lec.section === section);
                            return (
                                <Accordion.Item eventKey={index.toString()} key={index}>
                                    <Accordion.Header>{section}</Accordion.Header>
                                    <Accordion.Body>
                                        {lecture ? (
                                            <div>
                                                <p className="whitespace-pre-wrap">{lecture.content}</p>
                                                <Button
                                                    variant={lecture.completed ? "success" : "outline-success"}
                                                    onClick={() => handleCompleteLecture(lecture.id)}
                                                    disabled={lecture.completed}
                                                >
                                                    {lecture.completed ? '已完成' : '標記完成'}
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="info"
                                                onClick={() => handleGenerateLecture(section)}
                                                disabled={loading}
                                            >
                                                {loading ? <LoadingSpinner size="sm" /> : '生成講義'}
                                            </Button>
                                        )}
                                    </Accordion.Body>
                                </Accordion.Item>
                            );
                        })}
                    </Accordion>
                </Card.Body>
            </Card>
        </Container>
    );
};

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

const DashboardPage = ({ handleLogout, generatePlan, getProgress, progress, plan, loading, authLoading, setView }) => (
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
                <Card className="custom-card mb-4 h-100">
                    <Card.Header>學習進度 & 計畫</Card.Header>
                    <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {plan && (
                            <motion.div
                                className="latest-plan-section"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h4>最新計畫:</h4>
                                <p className="text-light small whitespace-pre-wrap">{plan.plan}</p>
                                <Button variant="info" onClick={() => setView('lecture', { planId: plan.id, planContent: plan.plan })}>
                                    查看講義
                                </Button>
                            </motion.div>
                        )}
                        <div className="progress-history-section">
                            <h4>歷史計畫:</h4>
                            {progress.length === 0 && !plan && <Alert variant="secondary">尚無計畫記錄。</Alert>}
                            {progress.length > 0 && (
                                <ListGroup variant="flush">
                                    {progress.map((item, index) => (
                                        <ListGroup.Item key={index} className="custom-list-item">
                                            <div className="fw-bold">{item.goal}</div>
                                            <small className="text-muted">
                                                創建時間: {new Date(item.created_at).toLocaleString()}
                                            </small>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                onClick={() => setView('lecture', { planId: item.id, planContent: item.plan })}
                                            >
                                                查看講義
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    </Container>
);

// --- App Component ---
const App = () => {
    const [view, setView] = useState('login');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [plan, setPlan] = useState(null);
    const [progress, setProgress] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const handleApiCall = async (apiFunc, setLoadingFunc, successMessage, errorMessagePrefix) => {
        setLoadingFunc(true);
        try {
            const response = await apiFunc();
            if (successMessage) toast.success(successMessage);
            return response;
        } catch (error) {
            toast.error(error.response?.data?.message || `${errorMessagePrefix}失敗`);
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
        if (success) setView('login');
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
            setPlan(null);
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
            setPlan({ plan: response.data.plan, id: response.data.plan_id });
            await getProgress(false);
        }
    };

    const getProgress = useCallback(async (setLoad = true) => {
        if (setLoad) setDataLoading(true);
        try {
            const response = await apiClient.get('/learning_progress');
            setProgress(response.data || []);
        } catch (error) {
            toast.error('獲取進度失敗');
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
            case 'lecture':
                return selectedPlan && (
                    <LecturePage
                        planId={selectedPlan.planId}
                        planContent={selectedPlan.planContent}
                        setView={setView}
                    />
                );
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
                        setView={(view, planData) => {
                            setView(view);
                            if (planData) setSelectedPlan(planData);
                        }}
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
        <div className="app-container" style={{ backgroundImage: `url(${backgroundImageUrl})` }}>
            <Toaster />
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