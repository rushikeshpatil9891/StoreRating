import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Alert, Spinner, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const RatingHistory = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 20,
    offset: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRatings: 0
  });

  const fetchRatings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await api.get(`/ratings/user?${params}`);
      setRatings(response.data.ratings || []);

      // Calculate pagination info
      const totalRatings = response.data.pagination?.total || 0;
      const totalPages = Math.ceil(totalRatings / filters.limit);
      setPagination({
        currentPage: Math.floor(filters.offset / filters.limit) + 1,
        totalPages,
        totalRatings
      });
    } catch (error) {
      setError('Failed to load rating history');
      console.error('Rating history error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (user) {
      fetchRatings();
    }
  }, [fetchRatings, user]);

  const handlePageChange = (newPage) => {
    const newOffset = (newPage - 1) * filters.limit;
    setFilters(prev => ({ ...prev, offset: newOffset }));
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleSortChange = (sortBy) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: newSortOrder,
      offset: 0
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
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

  const getRatingText = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4) return 'Very Good';
    if (rating >= 3) return 'Good';
    if (rating >= 2) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading your rating history...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Rating History</h2>
        <div className="text-muted">
          Total Ratings: {pagination.totalRatings}
        </div>
      </div>

      {/* Sort Controls */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex gap-2 flex-wrap">
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
            <Button
              variant={filters.sortBy === 'store_name' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => handleSortChange('store_name')}
            >
              Store {filters.sortBy === 'store_name' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Ratings List */}
      {ratings.length === 0 ? (
        <Alert variant="info">
          You haven't rated any stores yet. Start exploring stores and leave your reviews!
        </Alert>
      ) : (
        <Row>
          {ratings.map((rating) => (
            <Col key={rating.id} md={6} className="mb-3">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{rating.store_name}</h6>
                      <small className="text-muted d-block">{rating.store_email}</small>
                    </div>
                    <Badge bg={getRatingBadgeVariant(rating.rating)}>
                      {rating.rating}/5
                    </Badge>
                  </div>

                  <div className="mb-2">
                    <div className="fs-5 mb-1">
                      {renderStars(rating.rating)}
                    </div>
                    <small className="text-muted">
                      {getRatingText(rating.rating)}
                    </small>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Rated on {new Date(rating.created_at).toLocaleDateString()}
                    </small>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => window.open(`/stores/${rating.store_id}`, '_blank')}
                    >
                      View Store
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Button
            variant="outline-primary"
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            className="me-2"
          >
            Previous
          </Button>
          <span className="align-self-center mx-3">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline-primary"
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Summary Statistics */}
      {ratings.length > 0 && (
        <Card className="mt-4">
          <Card.Header>
            <h6>Rating Summary</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <div className="text-center">
                  <div className="fs-4 fw-bold text-primary">
                    {(ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)}
                  </div>
                  <small className="text-muted">Average Rating</small>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center">
                  <div className="fs-4 fw-bold text-success">
                    {ratings.filter(r => r.rating >= 4).length}
                  </div>
                  <small className="text-muted">High Ratings (4-5★)</small>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center">
                  <div className="fs-4 fw-bold text-warning">
                    {ratings.filter(r => r.rating >= 3 && r.rating < 4).length}
                  </div>
                  <small className="text-muted">Medium Ratings (3★)</small>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center">
                  <div className="fs-4 fw-bold text-danger">
                    {ratings.filter(r => r.rating < 3).length}
                  </div>
                  <small className="text-muted">Low Ratings (1-2★)</small>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default RatingHistory;
