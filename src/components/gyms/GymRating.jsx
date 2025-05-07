// src/components/gyms/GymRating.jsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Spinner, Alert, ListGroup } from 'react-bootstrap';
import api from '../../services/api';
import './GymRating.css'; 

const GymRating = ({ gymId }) => {
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);


  useEffect(() => {
    if (gymId) {
      fetchRatings();
    }
  }, [gymId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/analytics/gym-ratings/?gym=${gymId}`);

      if (response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        setRatings(data);


        const isAuthenticated = !!localStorage.getItem('token');
        if (isAuthenticated) {
          try {
            const userResponse = await api.get('/api/v1/users/me/');
            const userId = userResponse.data.id;

            const userRatingObj = response.data.find(rating => rating.user === userId);
            if (userRatingObj) {
              setUserRating(userRatingObj.rating);
              setComment(userRatingObj.comment || '');
              setEditMode(true);
            }
          } catch (userErr) {
            console.error('Ошибка при получении данных пользователя:', userErr);
          }
        }
      }
    } catch (err) {
      console.error('Ошибка при загрузке рейтингов:', err);
      setError('Не удалось загрузить отзывы');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (newRating) => {
    setUserRating(newRating);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userRating === 0) {
      setError('Пожалуйста, выберите рейтинг от 1 до 5');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const ratingData = {
        gym: gymId,
        rating: userRating,
        comment
      };

      await api.post('/api/v1/analytics/gym-ratings/', ratingData);

      setSuccess('Спасибо за ваш отзыв!');
      await fetchRatings();
      setEditMode(true);
    } catch (err) {
      console.error('Ошибка при отправке отзыва:', err);

      if (err.response && err.response.data && err.response.data[0] === 'Рейтинг обновлен') {
        setSuccess('Ваш отзыв успешно обновлен!');
        await fetchRatings();
      } else {
        setError('Не удалось отправить отзыв. Пожалуйста, попробуйте позже.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const calculateAverageRating = () => {
    if (!Array.isArray(ratings) || ratings.length === 0) return 0;
  
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };
  

  const renderStars = (rating, interactive = false) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => interactive && handleRatingChange(star)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            <i className={`bi ${star <= rating ? 'bi-star-fill' : 'bi-star'} text-warning`}></i>
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center my-3">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  const averageRating = calculateAverageRating();

  return (
    <div className="gym-rating">
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Отзывы и рейтинг</Card.Title>

          <div className="average-rating d-flex align-items-center mb-3">
            <div className="rating-value fs-2 me-2">{averageRating}</div>
            {renderStars(averageRating)}
            <span className="ms-2 text-muted">
              ({ratings.length} {ratings.length === 1 ? 'отзыв' :
                ratings.length >= 2 && ratings.length <= 4 ? 'отзыва' : 'отзывов'})
            </span>
          </div>

          {localStorage.getItem('token') ? (
            <Card className="mb-4">
              <Card.Body>
                <h6>{editMode ? 'Изменить ваш отзыв' : 'Оставить отзыв'}</h6>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ваша оценка</Form.Label>
                    <div>{renderStars(userRating, true)}</div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Комментарий (необязательно)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={comment}
                      onChange={handleCommentChange}
                      placeholder="Поделитесь своим опытом..."
                      disabled={submitting}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting || userRating === 0}
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-1"
                        />
                        Отправка...
                      </>
                    ) : (
                      editMode ? 'Обновить отзыв' : 'Отправить отзыв'
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <Alert variant="info">
              <a href="/login">Войдите</a> или <a href="/register">зарегистрируйтесь</a>, чтобы оставить отзыв
            </Alert>
          )}

          <h6>Все отзывы</h6>
          {ratings.length === 0 ? (
            <p className="text-muted">Пока нет отзывов</p>
          ) : (
            <ListGroup variant="flush">
              {ratings.map((rating) => (
                <ListGroup.Item key={rating.id} className="border-0 border-bottom py-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <div className="user-avatar me-2">
                        {rating.user_details && rating.user_details.profile_picture ? (
                          <img
                            src={rating.user_details.profile_picture}
                            alt={`${rating.user_details.username}`}
                            className="rounded-circle"
                            width="30"
                            height="30"
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            <i className="bi bi-person-circle fs-4"></i>
                          </div>
                        )}
                      </div>
                      <div>
                        <strong>{rating.user_details ? rating.user_details.username : 'Пользователь'}</strong>
                        <div className="small text-muted">{formatDate(rating.created_at)}</div>
                      </div>
                    </div>
                    <div>{renderStars(rating.rating)}</div>
                  </div>
                  {rating.comment && <p className="mb-0">{rating.comment}</p>}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default GymRating;