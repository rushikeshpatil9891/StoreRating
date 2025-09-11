import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Alert, Spinner, Button, Badge, Modal, Table } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const RatingManagement = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ratingToDelete, setRatingToDelete] = useState(null);
  const [filters, setFilters] = useState({
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 20,
    offset: 0
  });

  const fetchStores = useCallback(async () => {
    try {
      const response = await api.get('/stores');
      // Filter stores owned by current user
      const ownedStores = response.data.stores.filter(store => store.owner_id === user.id);
      setStores(ownedStores);

      // Auto-select first store if available
      if (ownedStores.length > 0 && !selectedStore) {
        setSelectedStore(ownedStores[0]);
      }
    } catch (error) {
      setError('Failed to load stores');
      console.error('Stores fetch error:', error);
    }
  }, [user.id, selectedStore]);

  const fetchRatings = useCallback(async () => {
    if (!selectedStore) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await api.get(`/ratings/store/${selectedStore.id}?${params}`);
      setRatings(response.data);
    } catch (error) {
      setError('Failed to load ratings');
      console.error('Ratings fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedStore, filters]);

  useEffect(() => {
    if (user) {
      fetchStores();
    }
  }, [fetchStores, user]);

  useEffect(() => {
    if (selectedStore) {
      fetchRatings();
    }
  }, [fetchRatings, selectedStore]);

  const handleStoreChange = (store) => {
    setSelectedStore(store);
    setFilters(prev => ({ ...prev, offset: 0 }));
  };

  const handleSortChange = (sortBy) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: newSortOrder,
      offset: 0
    }));
  };

  const handleDeleteRating = async () => {
    if (!ratingToDelete) return;

    try {
      await api.delete(`/ratings/${ratingToDelete.id}`);
      setRatings(prev => prev.filter(rating => rating.id !== ratingToDelete.id));
      setShowDeleteModal(false);
      setRatingToDelete(null);
    } catch (error) {
      setError('Failed to delete rating');
      console.error('Delete rating error:', error);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={i <= rating ? 'text-warning' : 'text-muted'}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const getRatingBadgeVariant = (rating) => {
    if (rating >= 4) return 'success';
    if (rating >= 3) return 'primary';
    if (rating >= 2) return 'warning';
    return 'danger';
  };

  if (loading && !selectedStore) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading your stores...</p>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <Alert variant="info">
        You don't own any stores yet. Create a store first to manage ratings.
      </Alert>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Rating Management</h2>
        <Button
          variant="primary"
          onClick={() => window.open('/stores/new', '_blank')}
        >
          Add New Store
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Store Selector */}
      <Card className="mb-4">
        <Card.Header>
          <h6>Select Store</h6>
        </Card.Header>
        <Card.Body>
          <Row>
            {stores.map((store) => (
              <Col key={store.id} md={4} className="mb-3">
                <Card
                  className={`cursor-pointer ${selectedStore?.id === store.id ? 'border-primary' : ''}`}
                  onClick={() => handleStoreChange(store)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body className="text-center">
                    <Card.Title className="fs-6">{store.name}</Card.Title>
                    <div className="mb-2">
                      {renderStars(parseFloat(store.average_rating) || 0)}
                    </div>
                    <small className="text-muted">
                      {store.total_ratings || 0} reviews
                    </small>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {selectedStore && (
        <>
          {/* Store Info */}
          <Card className="mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={8}>
                  <h5>{selectedStore.name}</h5>
                  <p className="mb-1">{selectedStore.email}</p>
                  <p className="mb-0 text-muted">{selectedStore.address}</p>
                </Col>
                <Col md={4} className="text-end">
                  <div className="fs-4 mb-1">
                    {renderStars(parseFloat(selectedStore.average_rating) || 0)}
                  </div>
                  <div className="fs-6 text-muted">
                    {parseFloat(selectedStore.average_rating)?.toFixed(1) || '0.0'} avg • {selectedStore.total_ratings || 0} reviews
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Ratings Table */}
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h6>Ratings for {selectedStore.name}</h6>
                <div className="d-flex gap-2">
                  <Button
                    variant={filters.sortBy === 'created_at' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => handleSortChange('created_at')}
                  >
                    Date {filters.sortBy === 'created_at' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
                  </Button>
                  <Button
                    variant={filters.sortBy === 'rating' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => handleSortChange('rating')}
                  >
                    Rating {filters.sortBy === 'rating' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center p-4">
                  <Spinner animation="border" />
                  <p className="mt-2">Loading ratings...</p>
                </div>
              ) : ratings.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted mb-0">No ratings yet for this store.</p>
                </div>
              ) : (
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>User</th>
                      <th>Rating</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratings.map((rating) => (
                      <tr key={rating.id}>
                        <td>
                          <div>
                            <strong>{rating.user_name}</strong>
                            <br />
                            <small className="text-muted">{rating.user_email}</small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              {renderStars(rating.rating)}
                            </div>
                            <Badge bg={getRatingBadgeVariant(rating.rating)}>
                              {rating.rating}/5
                            </Badge>
                          </div>
                        </td>
                        <td>
                          {new Date(rating.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setRatingToDelete(rating);
                              setShowDeleteModal(true);
                            }}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Rating</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the rating from{' '}
          <strong>{ratingToDelete?.user_name}</strong>? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteRating}>
            Delete Rating
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RatingManagement;
