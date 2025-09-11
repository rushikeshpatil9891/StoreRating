import React, { useState, useEffect } from 'react';
import { Card, Alert, Container, Row, Col, Spinner, Button, Badge, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data || []);
    } catch (error) {
      setError('Failed to load notifications');
      console.error('Notifications fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  };

  const openNotificationModal = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'rating': return '⭐';
      case 'store': return '🏪';
      case 'user': return '👤';
      case 'system': return '⚙️';
      default: return '📢';
    }
  };

  const getNotificationBadge = (type) => {
    switch (type) {
      case 'rating': return 'primary';
      case 'store': return 'success';
      case 'user': return 'info';
      case 'system': return 'warning';
      default: return 'secondary';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Loading notifications...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h3>
                  Notifications
                  {unreadCount > 0 && (
                    <Badge bg="danger" className="ms-2">
                      {unreadCount}
                    </Badge>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    Mark All Read
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              {notifications.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No notifications yet</p>
                </div>
              ) : (
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`notification-item p-3 mb-2 border rounded cursor-pointer ${
                        !notification.is_read ? 'bg-light' : ''
                      }`}
                      onClick={() => openNotificationModal(notification)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-1">
                            <span className="me-2 fs-5">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <Badge bg={getNotificationBadge(notification.type)} className="me-2">
                              {notification.type}
                            </Badge>
                            <small className="text-muted">
                              {new Date(notification.created_at).toLocaleString()}
                            </small>
                          </div>
                          <h6 className="mb-1">{notification.title}</h6>
                          <p className="mb-0 text-muted small">
                            {notification.message.length > 100
                              ? `${notification.message.substring(0, 100)}...`
                              : notification.message
                            }
                          </p>
                        </div>
                        <div className="d-flex flex-column gap-1">
                          {!notification.is_read && (
                            <div
                              className="bg-primary rounded-circle"
                              style={{ width: '8px', height: '8px' }}
                            ></div>
                          )}
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Notification Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedNotification && (
              <>
                <span className="me-2">
                  {getNotificationIcon(selectedNotification.type)}
                </span>
                {selectedNotification.title}
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification && (
            <div>
              <div className="mb-3">
                <Badge bg={getNotificationBadge(selectedNotification.type)}>
                  {selectedNotification.type}
                </Badge>
                <small className="text-muted ms-2">
                  {new Date(selectedNotification.created_at).toLocaleString()}
                </small>
              </div>
              <p className="fs-5">{selectedNotification.message}</p>
              {selectedNotification.data && (
                <div className="mt-3">
                  <h6>Additional Details:</h6>
                  <pre className="bg-light p-2 rounded">
                    {JSON.stringify(selectedNotification.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Notifications;
