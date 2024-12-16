import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Dashboard from './Dashboard';
import Login from './Login';
import Register from './Register';
import axios from 'axios';
import Cookies from 'js-cookie';
 
const PrivateRoute = ({ children }) => {
    const { authState } = useAuth();
    return authState.isLogin ? children : <Navigate to="/login" />;
};

const App = () => {
    const { setAuthState } = useAuth(); // Assuming you have a setter for authState in context

    useEffect(() => {
        // Get the token from cookies
        const token = Cookies.get('auth_token');
        
        if (token) {
            // Send the token to the server to verify and fetch user data
            axios.post('/api/verify-token', { token })
                .then((response) => {
                    // Assuming the response contains a valid user object and success status
                    if (response.data.success) {
                        setAuthState({
                            isLogin: true,
                            user: response.data.user,
                        });
                    } else {
                        setAuthState({ isLogin: false });
                    }
                })
                .catch((error) => {
                    console.error('Error verifying token:', error);
                    setAuthState({ isLogin: false });
                });
        } else {
            // No token in cookies, set state to logged out
            setAuthState({ isLogin: false });
        }
    }, [setAuthState]); // Run once on mount to check token

    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </AuthProvider>
    );
};

export default App;
