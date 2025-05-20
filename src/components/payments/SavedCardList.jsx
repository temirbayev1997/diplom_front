import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ListGroup, Button } from 'react-bootstrap';

const SavedCardList = ({ onCardDeleted }) => {
  const [cards, setCards] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCards = async () => {
    try {
      const res = await api.get('/api/v1/payments/saved-cards/');
      setCards(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCards([]);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить эту карту?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/v1/payments/saved-cards/delete/${id}/`);
      setCards(cards.filter(card => card.id !== id));
      if (onCardDeleted) onCardDeleted();
    } catch {
      alert('Ошибка при удалении карты');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ListGroup>
      {cards.length === 0 && (
        <ListGroup.Item className="text-muted">Нет сохранённых карт</ListGroup.Item>
      )}
      {cards.map(card => (
        <ListGroup.Item key={card.id} className="d-flex justify-content-between align-items-center">
          <span>
            {card.masked_card_number} ({card.expiry_month}/{card.expiry_year})
          </span>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(card.id)}
            disabled={deletingId === card.id}
          >
            {deletingId === card.id ? 'Удаление...' : 'Удалить'}
          </Button>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default SavedCardList;
