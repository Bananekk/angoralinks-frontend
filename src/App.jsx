import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Unlock from './pages/Unlock';
import Stats from './pages/Stats';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Verify from './pages/Verify';
import Payouts from './pages/Payouts';
import Terms from './pages/Terms';
import Contact from './pages/Contact';

function App() {
    return (
        <BrowserRouter>
            <Toaster 
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#1e293b',
                        color: '#f8fafc',
                        border: '1px solid #334155'
                    }
                }}
            />
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
            </Routes>
        </BrowserRouter>
    );
}

export default App;