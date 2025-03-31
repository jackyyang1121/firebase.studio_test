import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
    Container, Row, Col, Card, Form, Button, Spinner, Alert, ListGroup
} from 'react-bootstrap';
import './App.css'; // 引入自訂 CSS


// --- Configuration ---
const backendUrl = 'https://ai-learning-assistant-30563387234.asia-east1.run.app';
// 使用你的背景圖片 URL，或保持這個範例 URL
const backgroundImageUrl = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80';

// --- Axios Instance ---
const apiClient = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
});

// --- Helper Components ---

// 封裝後的載入指示器
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
            className="w-100" // 確保 motion div 佔滿寬度
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
    const [goal, setGoal] = useState('');

    const handleGenerate = () => {
        if (!goal.trim()) {
            toast.error('請輸入學習目標');
            return;
        }
        generatePlan(goal);
        setGoal(''); // 清空輸入
    };

    return (
        <Card className="custom-card mb-4 h-100">
            <Card.Header>生成學習計畫</Card.Header>
            <Card.Body className="d-flex flex-column">
                 <Form.Group className="mb-3" controlId="goal">
                     <Form.Label>學習目標</Form.Label>
                     <Form.Control
                         type="text"
                         placeholder="例如：學習 React Hooks"
                         value={goal}
                         onChange={(e) => setGoal(e.target.value)}
                         disabled={loading}
                     />
                 </Form.Group>
                 <Button
                     variant="info"
                     onClick={handleGenerate}
                     disabled={loading}
                     className="mt-auto" // 將按鈕推到底部
                 >
                     {loading ? <LoadingSpinner size="sm" /> : '生成計畫'}
                 </Button>
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
            {/* Display Latest Generated Plan */}
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

            {/* Display Progress History */}
             <div className="progress-history-section">
                <h4>學習歷史記錄:</h4>
                {loading && progress.length === 0 && <div className="text-center p-3"><LoadingSpinner /></div>}
                {!loading && progress.length === 0 && !plan && ( // Also check if plan exists
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
    const [view, setView] = useState('login'); // 'login', 'register', 'dashboard'
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [plan, setPlan] = useState('');
    const [progress, setProgress] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true); // 初始檢查載入狀態
    const [authLoading, setAuthLoading] = useState(false); // 登入/註冊/登出 載入狀態
    const [dataLoading, setDataLoading] = useState(false); // 獲取計畫/進度 載入狀態

    // --- API Call Functions (與之前版本相同，使用 toast) ---
    const handleApiCall = async (apiFunc, setLoadingFunc, successMessage, errorMessagePrefix) => {
        setLoadingFunc(true);
        try {
            const response = await apiFunc();
            if (successMessage) toast.success(successMessage); // 只有成功訊息才顯示
            return response;
        } catch (error) {
            const message = error.response?.data?.message || error.message || `${errorMessagePrefix}失敗`;
            toast.error(message);
            console.error(errorMessagePrefix, error);
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
            await getProgress(false); // 登入後獲取進度，不顯示載入狀態
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

    const generatePlan = async (goal) => {
        const response = await handleApiCall(
            () => apiClient.post('/generate_plan', { goal }),
            setDataLoading,
            '學習計畫生成成功！',
            '生成計畫'
        );
        if (response) {
            setPlan(response.data.plan);
            await getProgress(false); // 生成後刷新進度，不顯示載入狀態
        }
    };

    const getProgress = useCallback(async (setLoad = true) => {
         if (setLoad) setDataLoading(true);
         try {
            const response = await apiClient.get('/learning_progress');
            setProgress(response.data || []);
        } catch (error) {
            if (setLoad) {
                 const message = error.response?.data?.message || error.message || '獲取進度失敗';
                 toast.error(message);
                 console.error('獲取進度', error);
            } else {
                 console.error("後台獲取進度失敗:", error.response?.data?.message || error.message);
            }
            setProgress([]);
        } finally {
            if (setLoad) setDataLoading(false);
        }
    }, []); // useCallback 依賴為空

    // Check login status on initial load
    const checkLoginStatus = useCallback(async () => {
        setInitialLoading(true); // 開始檢查，顯示初始載入
        try {
            await apiClient.get('/check_login');
            setIsLoggedIn(true);
            setView('dashboard');
            await getProgress(false); // 初始載入時獲取進度，不顯示載入狀態
        } catch (error) {
            setIsLoggedIn(false);
            setView('login');
            console.log("尚未登入或 Session 過期");
        } finally {
            setInitialLoading(false); // 結束檢查，隱藏初始載入
        }
    }, [getProgress]); // 依賴 getProgress

    useEffect(() => {
        checkLoginStatus();
    }, [checkLoginStatus]);


    // --- Render Logic ---
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
                        authLoading={authLoading} // 傳遞登出載入狀態
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
                        zIndex: 9999, // 確保在最上層
                    },
                     duration: 4000, // 顯示時間加長
                }}
            />
            <div className="content-wrapper">
                 <motion.h1
                    className="main-title text-center mb-4 h2"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                 >
                     AI 學習助手
                 </motion.h1>

                <AnimatePresence mode="wait">
                     <motion.div
                        key={view} // Key 改變觸發動畫
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                        className="motion-div-wrapper" // 使用 wrapper class
                     >
                        {renderView()}
                     </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default App;