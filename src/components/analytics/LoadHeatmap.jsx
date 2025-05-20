import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Form } from 'react-bootstrap';
import analyticsService from '../../services/analyticsService';

const LoadHeatmap = ({ gymId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('current');

  useEffect(() => {
    if (gymId) {
      fetchPredictions();
    }
  }, [gymId, selectedWeek]);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      let response;
      if (selectedWeek === 'current') {
        response = await analyticsService.getCurrentWeekPredictions(gymId);
      } else {
        response = await analyticsService.getNextWeekPredictions(gymId); 
      }
      setPredictions(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Не удалось загрузить данные о загруженности');
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };
  
  

  // Преобразуем данные для тепловой карты
  const processData = () => {
    if (!predictions || predictions.length === 0) return [];

    // Создаем массив дней недели
    const weekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    
    // Группируем по дням недели и часам
    const groupedData = {};
    
    (predictions || []).forEach(item => {
      const date = new Date(item.date);
      const dayOfWeek = date.getDay(); // 0 - воскресенье, 1 - понедельник и т.д.
      const dayName = weekdays[dayOfWeek === 0 ? 6 : dayOfWeek - 1]; // Приводим к нашему формату (пн-вс)
      const hour = item.hour;
      
      if (!groupedData[dayName]) {
        groupedData[dayName] = {};
      }
      
      groupedData[dayName][hour] = item.predicted_load;
    });
    
    return groupedData;
  };

  const getColorForValue = (value, max = 100) => {
    // Определяем цвет в зависимости от загруженности
    const ratio = value / max;
    if (ratio < 0.3) return '#c8e6c9'; // Светло-зеленый (низкая загрузка)
    if (ratio < 0.6) return '#ffecb3'; // Светло-желтый (средняя загрузка)
    if (ratio < 0.8) return '#ffcc80'; // Светло-оранжевый (высокая загрузка)
    return '#ffab91'; // Светло-красный (очень высокая загрузка)
  };

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const data = processData();
  const weekdays = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="load-heatmap">
      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Тепловая карта загруженности</h5>
          <Form.Group className="mb-3">
            <Form.Label>Период</Form.Label>
            <Form.Select 
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              <option value="current">Текущая неделя</option>
              <option value="next">Следующая неделя</option>
            </Form.Select>
          </Form.Group>
          
          <div className="heatmap-container" style={{ overflowX: 'auto' }}>
            <div className="heatmap" style={{ display: 'grid', gridTemplateColumns: 'auto repeat(24, 1fr)' }}>
              {/* Заголовки часов */}
              <div style={{ gridColumn: '1', gridRow: '1', padding: '8px' }}></div>
              {hours.map(hour => (
                <div 
                  key={`hour-${hour}`} 
                  style={{ 
                    gridColumn: `${hour + 2}`, 
                    gridRow: '1',
                    textAlign: 'center',
                    padding: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {hour}:00
                </div>
              ))}
              
              {/* Данные по дням и часам */}
              {weekdays.map((day, dayIndex) => (
                <React.Fragment key={day}>
                  <div 
                    style={{ 
                      gridColumn: '1', 
                      gridRow: `${dayIndex + 2}`,
                      padding: '8px',
                      fontWeight: 'bold'
                    }}
                  >
                    {day}
                  </div>
                  
                  {hours.map(hour => (
                    <div 
                      key={`${day}-${hour}`}
                      style={{
                        gridColumn: `${hour + 2}`,
                        gridRow: `${dayIndex + 2}`,
                        backgroundColor: data[day] && data[day][hour] ? getColorForValue(data[day][hour]) : '#f8f9fa',
                        width: '30px',
                        height: '30px',
                        margin: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    >
                      {data[day] && data[day][hour] ? Math.round(data[day][hour]) : '-'}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="mt-3 d-flex justify-content-end">
            <div className="legend d-flex align-items-center">
              <span className="me-2">Загруженность:</span>
              <div className="d-flex align-items-center me-3">
                <div style={{ width: '15px', height: '15px', backgroundColor: '#c8e6c9', marginRight: '5px', borderRadius: '2px' }}></div>
                <small>Низкая</small>
              </div>
              <div className="d-flex align-items-center me-3">
                <div style={{ width: '15px', height: '15px', backgroundColor: '#ffecb3', marginRight: '5px', borderRadius: '2px' }}></div>
                <small>Средняя</small>
              </div>
              <div className="d-flex align-items-center me-3">
                <div style={{ width: '15px', height: '15px', backgroundColor: '#ffcc80', marginRight: '5px', borderRadius: '2px' }}></div>
                <small>Высокая</small>
              </div>
              <div className="d-flex align-items-center">
                <div style={{ width: '15px', height: '15px', backgroundColor: '#ffab91', marginRight: '5px', borderRadius: '2px' }}></div>
                <small>Очень высокая</small>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoadHeatmap;