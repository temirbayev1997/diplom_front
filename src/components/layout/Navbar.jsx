import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BiBell, BiUser, BiDumbbell, BiCalendar, BiHomeAlt, BiSpreadsheet } from 'react-icons/bi';
import './Navbar.css';
import api from '../../services/api'; 

const AppNavbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [notificationsCount, setNotificationsCount] = useState(0);

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };

    const fetchUnreadNotifications = async () => {
      try {
        const response = await api.get('/api/v1/notifications/');
        const data = Array.isArray(response.data.results) ? response.data.results : [];
        const unreadCount = data.filter(n => !n.is_read).length;
        setNotificationsCount(unreadCount);
      } catch (err) {
        console.error('Ошибка при загрузке уведомлений:', err);
      }
    };

    checkAuth();

    if (localStorage.getItem('token')) {
      fetchUnreadNotifications();
    }

    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <Navbar bg="white" expand="lg" className="custom-navbar">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <BiDumbbell size={30} className="me-2 text-primary" />
          <span className="brand-text">FitBooking</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="nav-link">
              <BiHomeAlt className="nav-icon" /> Главная
            </Nav.Link>
            <Nav.Link as={Link} to="/gyms" className="nav-link">
              <BiDumbbell className="nav-icon" /> Тренажерные залы
            </Nav.Link>
            <Nav.Link as={Link} to="/gym-load-status" className="nav-link">
              <BiSpreadsheet className="nav-icon" /> Загруженность залов
            </Nav.Link>
          </Nav>

          {isAuthenticated && (
            <div className="d-flex align-items-center">
              <div className="position-relative me-3">
                <button
                  className="btn btn-light notification-button rounded-circle"
                  onClick={() => navigate('/notifications')}
                >
                  <BiBell size={20} />
                  {notificationsCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {notificationsCount}
                    </span>
                  )}
                </button>
              </div>

              <Dropdown align="end">
                <Dropdown.Toggle variant="light" id="dropdown-user" className="user-dropdown">
                  <BiUser size={20} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">Мой профиль</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/dashboard">Мои бронирование</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>Выйти</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;