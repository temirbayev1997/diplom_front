// src/pages/NotificationsPage.js
import React, { useState } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Form } from 'react-bootstrap';
import NotificationList from '../components/notifications/NotificationList';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    booking_reminders: true,
    promo_notifications: true
  });

  const handleSettingChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));

    // В реальном приложении здесь должен быть запрос к API для сохранения настроек
    // Например:
    // api.patch('/api/v1/notifications/settings/', { [name]: checked });
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Уведомления</h1>
      
      <Row>
        <Col lg={8}>
          <Card>
            <Card.Body>
              <Tabs defaultActiveKey="all" id="notification-tabs" className="mb-4">
                <Tab eventKey="all" title="Все">
                  <NotificationList />
                </Tab>
                <Tab eventKey="unread" title="Непрочитанные">
                  {/* Здесь можно передать фильтр в компонент NotificationList */}
                  <NotificationList filter="unread" />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card>
            <Card.Body>
              <h5 className="mb-3">Настройки уведомлений</h5>
              
              <Form>
                <div className="mb-4">
                  <h6 className="mb-3">Способы получения</h6>
                  
                  <Form.Check 
                    type="switch"
                    id="email-notifications"
                    name="email_notifications"
                    label="Email уведомления"
                    checked={notificationSettings.email_notifications}
                    onChange={handleSettingChange}
                    className="mb-2"
                  />
                  
                  <Form.Check 
                    type="switch"
                    id="push-notifications"
                    name="push_notifications"
                    label="Push уведомления"
                    checked={notificationSettings.push_notifications}
                    onChange={handleSettingChange}
                    className="mb-2"
                  />
                  
                  <Form.Check 
                    type="switch"
                    id="sms-notifications"
                    name="sms_notifications"
                    label="SMS уведомления"
                    checked={notificationSettings.sms_notifications}
                    onChange={handleSettingChange}
                  />
                </div>
                
                <div>
                  <h6 className="mb-3">Типы уведомлений</h6>
                  
                  <Form.Check 
                    type="switch"
                    id="booking-reminders"
                    name="booking_reminders"
                    label="Напоминания о бронированиях"
                    checked={notificationSettings.booking_reminders}
                    onChange={handleSettingChange}
                    className="mb-2"
                  />
                  
                  <Form.Check 
                    type="switch"
                    id="promo-notifications"
                    name="promo_notifications"
                    label="Рекомендации и промо"
                    checked={notificationSettings.promo_notifications}
                    onChange={handleSettingChange}
                  />
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          <Card className="mt-4">
            <Card.Body>
              <h5 className="mb-3">О системе уведомлений</h5>
              <p className="text-muted mb-0">
                Мы отправляем уведомления о предстоящих бронированиях, рекомендации
                по оптимальному времени для тренировок и информацию о загруженности
                ваших любимых залов.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NotificationsPage;