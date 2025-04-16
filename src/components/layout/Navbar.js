import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BiBell, BiUser, BiDumbbell, BiCalendar, BiHomeAlt } from 'react-icons/bi';
import './Navbar.css';

const AppNavbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [notificationsCount, setNotificationsCount] = useState(3); // Для примера

  useEffect(() => {
    // Обновляем состояние при монтировании и при изменении localStorage
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', checkAuth);
    checkAuth();

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
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
            {isAuthenticated && (
              <Nav.Link as={Link} to="/bookings" className="nav-link">
                <BiCalendar className="nav-icon" /> Мои бронирования
              </Nav.Link>
            )}
          </Nav>
          
          {isAuthenticated ? (
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
                  <Dropdown.Item as={Link} to="/subscriptions">Мои абонементы</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>Выйти</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          ) : null}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;