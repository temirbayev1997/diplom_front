
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Tab, Tabs, Image, Modal } from 'react-bootstrap';
import { BiUser, BiEnvelope, BiPhone, BiCalendar, BiHome, BiEdit } from 'react-icons/bi';
import api from '../services/api';
import './ProfilePage.css';
import UserPayments from '../components/payments/UserPayments';
import AddCardForm from '../components/payments/AddCardForm';
import SavedCardList from '../components/payments/SavedCardList';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bio');
  const [error, setError] = useState('');
  const [cardsVersion, setCardsVersion] = useState(0);
  const [showAddCard, setShowAddCard] = useState(false);
  const [mySubs, setMySubs] = useState([]);
  const [mySubsLoading, setMySubsLoading] = useState(true);
  const [mySubsError, setMySubsError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    bio: ''
  });
  const [preference, setPreference] = useState({
    preferred_gym: '',
    preferred_day: '',
    preferred_hour: '',
    avoid_crowded: true
  });

  useEffect(() => {
    fetchUserProfile();
    fetchUserPreferences();
  }, []);
  const handleCardAdded = () => {
    setCardsVersion(v => v + 1);
    setShowAddCard(false); // Закрыть модалку после успешного добавления
  };  

  useEffect(() => {
    fetchUserProfile();
    fetchUserPreferences();
    fetchMySubscriptions();
  }, []);
  
  const fetchMySubscriptions = async () => {
    setMySubsLoading(true); setMySubsError('');
    try {
      const res = await api.get('/api/v1/subscriptions/my-subscriptions/');
      const arr = Array.isArray(res.data?.results) ? res.data.results : res.data;
      setMySubs(arr);
    } catch {
      setMySubsError('Ошибка при загрузке абонементов');
    } finally {
      setMySubsLoading(false);
    }
  };

  
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/users/me/');
      setProfile(response.data);
      
      // Заполняем форму данными профиля
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        date_of_birth: response.data.date_of_birth ? response.data.date_of_birth.split('T')[0] : '',
        address: response.data.address || '',
        bio: response.data.bio || ''
      });
    } catch (err) {
      console.error('Ошибка при загрузке профиля:', err);
      setError('Не удалось загрузить данные профиля');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const response = await api.get('/api/v1/analytics/user-preferences/');
      if (response.data && response.data.length > 0) {
        setPreference(response.data[0]);
      }
    } catch (err) {
      console.error('Ошибка при загрузке предпочтений:', err);
      // Не показываем ошибку пользователю, т.к. это некритично
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreference((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await api.patch('/api/v1/users/me/', formData);
      
      // Обновляем профиль после успешного обновления
      await fetchUserProfile();
      
      setSuccess('Профиль успешно обновлен');
      setEditing(false);
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
      
      if (err.response && err.response.data) {
        // Обрабатываем ошибки от API
        if (typeof err.response.data === 'object') {
          // Преобразуем объект ошибок в строку
          const errorMessages = Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
          setError(errorMessages);
        } else {
          setError('Произошла ошибка при обновлении профиля');
        }
      } else {
        setError('Не удалось подключиться к серверу');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setLoading(true);
      if (preference.id) {
        // Обновляем существующие предпочтения
        await api.patch(`/api/v1/analytics/user-preferences/${preference.id}/`, preference);
      } else {
        // Создаем новые предпочтения
        await api.post('/api/v1/analytics/user-preferences/', preference);
      }
      setSuccess('Предпочтения успешно сохранены');
      await fetchUserPreferences();
    } catch (err) {
      console.error('Ошибка при сохранении предпочтений:', err);
      setError('Не удалось сохранить предпочтения');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Восстанавливаем исходные данные
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : '',
        address: profile.address || '',
        bio: profile.bio || ''
      });
    }
    setEditing(false);
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Мой профиль</h1>
      
      {loading && !profile ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Загрузка профиля...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Row>
          <Col lg={4} md={5} className="mb-4">
            <Card className="profile-card">
              <Card.Body className="text-center">
                {profile?.profile_picture ? (
                  <Image 
                    src={profile.profile_picture} 
                    alt="Фото профиля" 
                    className="profile-image mb-3"
                    roundedCircle
                  />
                ) : (
                  <div className="profile-image-placeholder mb-3">
                    <BiUser size={60} />
                  </div>
                )}
                
                <h3>{profile?.first_name || ''} {profile?.last_name || profile?.username}</h3>
                <p className="text-muted">{profile?.email}</p>
                
                {!editing && (
                  <Button 
                    variant="outline-primary" 
                    className="mt-3"
                    onClick={() => setEditing(true)}
                  >
                    <BiEdit className="me-2" /> Редактировать профиль
                  </Button>
                )}
              </Card.Body>
            </Card>
            
            {!editing && (
              <Card className="mt-4">
                <Card.Body>
                  <h5 className="mb-3">Контактная информация</h5>
                  
                  <div className="profile-info-item">
                    <BiEnvelope className="profile-icon text-primary" />
                    <div>
                      <small className="text-muted">Email</small>
                      <p>{profile?.email || 'Не указан'}</p>
                    </div>
                  </div>
                  
                  <div className="profile-info-item">
                    <BiPhone className="profile-icon text-primary" />
                    <div>
                      <small className="text-muted">Телефон</small>
                      <p>{profile?.phone || 'Не указан'}</p>
                    </div>
                  </div>
                  
                  <div className="profile-info-item">
                    <BiCalendar className="profile-icon text-primary" />
                    <div>
                      <small className="text-muted">Дата рождения</small>
                      <p>{profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('ru-RU') : 'Не указана'}</p>
                    </div>
                  </div>
                  
                  <div className="profile-info-item">
                    <BiHome className="profile-icon text-primary" />
                    <div>
                      <small className="text-muted">Адрес</small>
                      <p>{profile?.address || 'Не указан'}</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
          
          <Col lg={8} md={7}>
            {success && <Alert variant="success">{success}</Alert>}
            
            {editing ? (
              <Card>
                <Card.Body>
                  <h4 className="mb-4">Редактирование профиля</h4>
                  
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Имя</Form.Label>
                          <Form.Control
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            disabled={loading}
                            className="profile-input"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Фамилия</Form.Label>
                          <Form.Control
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            disabled={loading}
                            className="profile-input"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                            className="profile-input"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Телефон</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={loading}
                            className="profile-input"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Дата рождения</Form.Label>
                      <Form.Control
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        disabled={loading}
                        className="profile-input"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Адрес</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={loading}
                        className="profile-input"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>О себе</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        disabled={loading}
                        className="profile-input"
                      />
                    </Form.Group>
                    
                    <div className="d-flex justify-content-end gap-2 mt-4">
                      <Button
                        variant="outline-secondary"
                        onClick={handleCancelEdit}
                        disabled={loading}
                      >
                        Отмена
                      </Button>
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Сохранение...
                          </>
                        ) : (
                          'Сохранить изменения'
                        )}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            ) : (
              <Tabs
                activeKey={activeTab}
                onSelect={setActiveTab}
                className="mb-4"
              >
                <Tab eventKey="activity" title="Активность">
  <Card>
    <Card.Body>
      <h6 className="mt-2 mb-3">Ваши абонементы</h6>
      {mySubsLoading ? (
        <Spinner animation="border" size="sm" />
      ) : mySubsError ? (
        <Alert variant="danger" className="py-1">{mySubsError}</Alert>
      ) : mySubs.length > 0 ? (
        <Row>
          {mySubs.slice(0, 3).map(sub => (
            <Col key={sub.id} md={4} className="mb-3">
              <Card className="h-100">
                <Card.Body>
                  <div className="fw-bold">{sub.plan_details?.name || 'Абонемент'}</div>
                  <div className="small text-muted">{sub.gym_details?.name || 'Зал не указан'}</div>
                  <div className="small">C {sub.start_date} по {sub.end_date}</div>
                  <div className="small">
                    Статус:&nbsp;
                    <span className={
                      sub.status === 'active' ? 'text-success' :
                      sub.status === 'expired' ? 'text-secondary' :
                      sub.status === 'cancelled' ? 'text-danger' : ''
                    }>
                      {sub.status === 'active' ? 'Активный' : sub.status === 'expired' ? 'Истёк' : 'Отменён'}
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <>
          <h5>Ваша активность</h5>
          <p className="text-muted">
            Здесь отображается история ваших тренировок и посещений.
          </p>
          <div className="text-center my-4">
            <p>У вас пока нет данных об активности</p>
            <Button variant="outline-primary" href="/gyms">Найти зал для тренировки</Button>
          </div>
        </>
      )}
    </Card.Body>
  </Card>
</Tab>          
                <Tab eventKey="bio" title="О себе">
                  <Card>
                    <Card.Body>
                      <h5>Биография</h5>
                      {profile?.bio ? (
                        <p>{profile.bio}</p>
                      ) : (
                        <p className="text-muted">Биография не заполнена.</p>
                      )}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="mt-3"
                        onClick={() => setEditing(true)}
                      >
                        <BiEdit className="me-1" /> Редактировать биографию
                      </Button>
                    </Card.Body>
                  </Card>
                </Tab>
                
                <Tab eventKey="settings" title="Настройки">
                  <Card>
                    <Card.Body>
                      <h5>Настройки аккаунта</h5>
                      <p className="text-muted">
                        Здесь вы можете изменить настройки своего аккаунта.
                      </p>
                      
                      <h5 className="mt-4">На данный момент вы не можете изменить пароль.</h5>
                      <p className="text-muted">
                        Для изменения пароля обратитесь к администратору.
                      </p>
                      <div className="mb-4">
                        <h6>Уведомления(Тест)</h6>
                        <Form.Check 
                          type="switch"
                          id="email-notifications"
                          label="Email уведомления"
                          defaultChecked
                        />
                      </div>
                    </Card.Body>
                  </Card>
                </Tab>
                <Tab eventKey="payments" title="Мои покупки">
    <Card>
      <Card.Body>
        <h5 className="mb-3">История покупок</h5>
        <UserPayments />
      </Card.Body>
    </Card>
  </Tab>
  <Tab eventKey="cards" title="Мои карты">
  <Card>
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Сохранённые карты</h5>
        <Button variant="outline-primary" onClick={() => setShowAddCard(true)}>
          Добавить карту
        </Button>
      </div>
      <SavedCardList key={cardsVersion} />

      <Modal show={showAddCard} onHide={() => setShowAddCard(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Добавить карту</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddCardForm onCardAdded={handleCardAdded} />
        </Modal.Body>
      </Modal>
    </Card.Body>
  </Card>
</Tab>

</Tabs>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ProfilePage;