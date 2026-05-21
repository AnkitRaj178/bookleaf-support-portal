import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { BookOpen } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('role', data.role);
            sessionStorage.setItem('name', data.name || '');
            sessionStorage.setItem('email', data.email || '');
            
            toast.success('Login successful!');
            
            if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/author');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-indigo-100 p-3 rounded-full mb-4">
                        <BookOpen className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">BookLeaf Publishing</h2>
                    <p className="text-slate-500 text-sm mt-1">Author Support Portal</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input 
                            type="email" 
                            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-md shadow-indigo-200 mt-2"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
