import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout, getUserRole } from '../services/api';
import '../styles/Navbar.css';
import logo from '../assets/logo.svg';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleHomeClick = (e) => {
        e.preventDefault();
        const role = getUserRole();
        if (role === 'Admin') {
            navigate('/Admin/dashboard');
        } else if (role === 'Instructor') {
            navigate('/instructor/dashboard');
        } else if (role === 'Student') {
            navigate('/student/dashboard');
        } else {
            navigate('/home');
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <img src={logo} alt="EduSync Logo" style={{ height: 40, marginRight: 12, verticalAlign: 'middle' }} />
                <Link to="/home" onClick={handleHomeClick} style={{ fontWeight: 'bold', fontSize: 24, color: '#FFC857', textDecoration: 'none' }}>
                    EduSync
                </Link>
            </div>
            <div className="nav-links">
                <Link to="/home" onClick={handleHomeClick}>Home</Link>
                <Link to="/profile">Profile</Link>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
        </nav>
    );
};

export default Navbar; 