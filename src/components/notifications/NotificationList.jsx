// src/components/notifications/NotificationList.jsx
import React, { useState, useEffect } from 'react';
import { ListGroup, Badge, Spinner, Button, Alert } from 'react-bootstrap';
import api from '../../services/api';
import './NotificationList.css';

const NotificationList = ({ filter }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/notifications/');
      const notifications = Array.isArray(response.data.results)
        ? response.data.results
        : [];
      setNotifications(notifications);
    } catch (err) {
      setError('Не удалось загрузить уведомления');
    } finally {
      setLoading(false);
    }
  };
   
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/api/v1/notifications/${notificationId}/`, {
        is_read: true
      });
      
      // Обновляем состояние локально
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
    } catch (err) {
      console.error('Ошибка при отметке уведомления как прочитанного:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/api/v1/notifications/mark-all-read/');
      
      // Обновляем все уведомления как прочитанные
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (err) {
      console.error('Ошибка при отметке всех уведомлений как прочитанных:', err);
    }
  };

  const getNotificationIcon = (type) => {
    let iconClass = 'bi-info-circle'; // default
  
    switch (type) {
      case 'booking':
        iconClass = 'bi-calendar-event';
        break;
      case 'reminder':
        iconClass = 'bi-info-circle';
        break;
      case 'crowding':
        iconClass = 'bi-people-fill';
        break;
      case 'low_load':
        iconClass = 'bi-speedometer2';
        break;
      case 'system':
        iconClass = 'bi-check-circle';
        break;
      case 'promo':
        iconClass = 'bi-megaphone-fill';
        break;
      default:
        iconClass = 'bi-info-circle';
    }
  
    return <i className={`bi ${iconClass} notification-icon ${type}`}></i>;
  };
  
  const formatCreatedAt = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} д. назад`;
    } else if (diffHour > 0) {
      return `${diffHour} ч. назад`;
    } else if (diffMin > 0) {
      return `${diffMin} мин. назад`;
    } else {
      return 'только что';
    }
  };

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка уведомлений...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const filteredNotifications = filter === 'unread'
  ? notifications.filter(n => !n.is_read)
  : notifications;

  return (
    <div className="notification-list">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          Уведомления
          {unreadCount > 0 && (
            <Badge bg="primary" className="ms-2">
              {unreadCount}
            </Badge>
          )}
        </h5>
        {unreadCount > 0 && (
          <Button
            variant="link"
            size="sm"
            className="text-muted"
            onClick={markAllAsRead}
          >
            Отметить все как прочитанные
          </Button>
        )}
      </div>

      {filteredNotifications.length === 0 ? (
        <Alert variant="info">У вас нет уведомлений</Alert>
      ) : (
        <ListGroup variant="flush">
          {filteredNotifications.map(notification => (
            <ListGroup.Item
              key={notification.id}
              className={`notification-item ${
                !notification.is_read ? 'unread' : ''
              }`}
              onClick={() =>
                !notification.is_read && markAsRead(notification.id)
              }
            >
              <div className="d-flex">
                <div className="me-3">{getNotificationIcon(notification.type)}</div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="mb-1">{notification.title}</h6>
                    <small className="text-muted">
                      {formatCreatedAt(notification.created_at)}
                    </small>
                  </div>
                  <p className="mb-0 notification-message">
                    {notification.message}
                  </p>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default NotificationList;