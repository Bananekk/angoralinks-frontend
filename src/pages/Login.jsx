import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link2, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success('Zalogowano pomyślnie!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Błąd logowania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <Link2 className="w-10 h-10 text-primary-500" />
            <span className="text-2xl font-bold">AngoraLinks</span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Zaloguj się</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-primary-500 transition"
                  placeholder="twoj@email.pl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Hasło
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-primary-500 transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logowanie...
                </>
              ) : (
                'Zaloguj się'
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6">
            Nie masz konta?{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-400">
              Zarejestruj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;