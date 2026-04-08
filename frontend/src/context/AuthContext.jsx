import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Persist session across reloads for better UX
        const saved = localStorage.getItem('fish_reg_user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = (role) => {
        // Placeholder for Bun/Express API verification: axios.post('/api/auth/login', { role })
        const newUser = { role, loggedIn: true, name: `User_${role}` };
        setUser(newUser);
        localStorage.setItem('fish_reg_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('fish_reg_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
