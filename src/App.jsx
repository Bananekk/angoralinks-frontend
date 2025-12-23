// App.jsx - ZOPTYMALIZOWANY
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';

// Loading Spinner Component
const LoadingSpinner = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    }}>
        <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #334155',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }} />
        <style>{`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

// Error Boundary Component
import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: '#0f172a',
                    color: '#f8fafc',
                    padding: '20px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ marginBottom: '16px' }}>Coś poszło nie tak</h2>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 24px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Odśwież stronę
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// 🚀 LAZY LOADING - strony ładowane na żądanie
// Krytyczne strony (pre-load hints)
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Unlock = lazy(() => import('./pages/Unlock'));

// Strony wymagające auth (ładowane po zalogowaniu)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Stats = lazy(() => import('./pages/Stats'));
const Profile = lazy(() => import('./pages/Profile'));
const Payouts = lazy(() => import('./pages/Payouts'));

// Strony rzadziej odwiedzane
const Admin = lazy(() => import('./pages/Admin'));
const Verify = lazy(() => import('./pages/Verify'));
const Terms = lazy(() => import('./pages/Terms'));
const Contact = lazy(() => import('./pages/Contact'));
const CpmRates = lazy(() => import('./pages/CpmRates'));

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#1e293b',
                            color: '#f8fafc',
                            border: '1px solid #334155'
                        }
                    }}
                />
                <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/l/:shortCode" element={<Unlock />} />
                        <Route path="/stats" element={<Stats />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/verify" element={<Verify />} />
                        <Route path="/payouts" element={<Payouts />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/cpm-rates" element={<CpmRates />} />
                        
                        {/* 404 Route */}
                        <Route path="*" element={
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: '100vh',
                                background: '#0f172a',
                                color: '#f8fafc'
                            }}>
                                <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>404</h1>
                                <p>Strona nie została znaleziona</p>
                                <a href="/" style={{ color: '#3b82f6', marginTop: '16px' }}>
                                    Wróć na stronę główną
                                </a>
                            </div>
                        } />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;