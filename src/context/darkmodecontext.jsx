import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

export const DarkModeContext = createContext();

const setSecureCookie = (name, value, days = 30) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; SameSite=Strict; Secure; Path=/`;
  };

export const DarkModeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check localStorage first
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode !== null) {
            return JSON.parse(savedMode);
        }
        // If not in localStorage, check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        // Update localStorage when isDarkMode changes
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        setSecureCookie('darkMode', JSON.stringify(isDarkMode));
        
        // Apply dark mode class to html element
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
};

DarkModeProvider.propTypes = {
    children: PropTypes.node.isRequired
};