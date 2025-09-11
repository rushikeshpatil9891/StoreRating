import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Button, Alert, Spinner, ListGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const StoreDetails = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [ratingsStats, setRatingsStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState(null);
  const [showRatingForm, setShowRatingForm] = useState(false);

  const fetchStoreDetails = useCallback(async () => {
    console.log('fetchStoreDetails called for store ID:', id);
    try {
      setLoading(true);

      // Fetch store details
      const storeResponse = await api.get(`/stores/${id}`);
      console.log('Store response data:', storeResponse.data);
      console.log('Store data structure:', storeResponse.data.store);
      setStore(storeResponse.data.store);
      
      console.log('Store set to state:', storeResponse.data.store);

      // Fetch store ratings
      const ratingsResponse = await api.get(`/ratings/store/${id}`);
      console.log('Ratings response data:', ratingsResponse.data);
      console.log('Ratings data structure:', ratingsResponse.data.ratings);
      console.log('Ratings response data type:', typeof ratingsResponse.data);
      console.log('Is ratings data an array?', Array.isArray(ratingsResponse.data.ratings));
      
      const ratingsData = Array.isArray(ratingsResponse.data.ratings) ? ratingsResponse.data.ratings : 
                         (ratingsResponse.data.ratings ? [ratingsResponse.data.ratings] : []);
      setRatings(ratingsData);
      
      // Store ratings statistics
      if (ratingsResponse.data.statistics) {
        console.log('Ratings statistics:', ratingsResponse.data.statistics);
        setRatingsStats(ratingsResponse.data.statistics);
      }

      // Check if user has already rated this store
      if (user) {
        const userRatingResponse = await api.get(`/ratings/user/${user.id}`);
        const userRatings = Array.isArray(userRatingResponse.data) ? userRatingResponse.data : [userRatingResponse.data].filter(Boolean);
        const existingRating = userRatings.find(r => r && r.store_id === parseInt(id));
        if (existingRating) {
          setUserRating(existingRating);
        }
      }
    } catch (error) {
      setError('Failed to load store details');
      console.error('Store details error:', error);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    console.log('StoreDetails component mounted/updated, fetching data for store ID:', id);
    fetchStoreDetails();
  }, [fetchStoreDetails, id]);

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`fs-4 ${interactive ? 'cursor-pointer' : ''} ${i <= rating ? 'text-warning' : 'text-muted'}`}
          onClick={interactive ? () => onRatingChange && onRatingChange(i) : undefined}
          style={interactive ? { cursor: 'pointer' } : {}}
        >
          {i <= rating ? '★' : '☆'}
        </span>
      );
    }

    return stars;
  };

  const handleRatingSubmit = async (rating) => {
    try {
      if (userRating) {
        // Update existing rating
        await api.put(`/ratings/${userRating.id}`, { rating });
        setUserRating({ ...userRating, rating });
      } else {
        // Create new rating
        const response = await api.post('/ratings', {
          store_id: parseInt(id),
          rating
        });
        setUserRating(response.data);
      }

      // Refresh store details and ratings
      await fetchStoreDetails();
      setShowRatingForm(false);
    } catch (error) {
      setError('Failed to submit rating');
      console.error('Rating submit error:', error);
    }
  };

  const canEditStore = () => {
    return user?.role === 'admin' || (user?.role === 'store_owner' && store?.owner_id === user?.id);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading store details...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!store) {
    return <Alert variant="warning">Store not found.</Alert>;
  }

  return (
    <div>
      {console.log('Rendering with store data:', store)}
      {console.log('Rendering with ratings data:', ratings)}
      {console.log('Rendering with ratingsStats:', ratingsStats)}
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{store.name}</h2>
        {canEditStore() && (
          <Link to={`/stores/${id}/edit`}>
            <Button variant="outline-primary">Edit Store</Button>
          </Link>
        )}
      </div>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h5>Store Information</h5>
                  <p><strong>Email:</strong> {store.email}</p>
                  <p><strong>Address:</strong> {store.address}</p>
                  <p><strong>Owner:</strong> {store.owner_name}</p>
                  <p><strong>Joined:</strong> {new Date(store.created_at).toLocaleDateString()}</p>
                </Col>
                <Col md={6}>
                  <h5>Rating Summary</h5>
                  <div className="mb-2">
                    <div className="fs-2 mb-2">
                      {renderStars(Math.round(parseFloat(ratingsStats?.average_rating) || 0))}
                    </div>
                    <div className="fs-4 fw-bold">
                      {parseFloat(ratingsStats?.average_rating)?.toFixed(1) || '0.0'} out of 5
                    </div>
                    <div className="text-muted">
                      Based on {ratingsStats?.total_ratings || 0} reviews
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Rating Form */}
          {user && !userRating && (
            <Card className="mb-4">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Rate this store</span>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowRatingForm(!showRatingForm)}
                  >
                    {showRatingForm ? 'Cancel' : 'Add Rating'}
                  </Button>
                </div>
              </Card.Header>
              {showRatingForm && (
                <Card.Body>
                  <p>Click on the stars to rate this store:</p>
                  <div className="mb-3">
                    {renderStars(0, true, handleRatingSubmit)}
                  </div>
                </Card.Body>
              )}
            </Card>
          )}

          {/* User's Existing Rating */}
          {userRating && (
            <Card className="mb-4">
              <Card.Header>Your Rating</Card.Header>
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    {renderStars(userRating.rating)}
                  </div>
                  <div>
                    <small className="text-muted">
                      Rated on {new Date(userRating.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="ms-auto"
                    onClick={() => setShowRatingForm(!showRatingForm)}
                  >
                    Update Rating
                  </Button>
                </div>
                {showRatingForm && (
                  <div className="mt-3">
                    <p>Update your rating:</p>
                    {renderStars(userRating.rating, true, handleRatingSubmit)}
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Ratings List */}
          <Card>
            <Card.Header>
              <h5>Customer Reviews ({Array.isArray(ratings) ? ratings.length : 0})</h5>
            </Card.Header>
            <Card.Body>
              {(() => {
                console.log('Rendering ratings:', ratings);
                console.log('Ratings type:', typeof ratings);
                console.log('Is ratings an array?', Array.isArray(ratings));
                console.log('Ratings length:', ratings?.length);
                
                const safeRatings = Array.isArray(ratings) ? ratings : [];
                
                return safeRatings.length === 0 ? (
                  <p className="text-muted">No reviews yet. Be the first to rate this store!</p>
                ) : (
                  <ListGroup variant="flush">
                    {safeRatings.map((rating) => (
                      <ListGroup.Item key={rating.id}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <strong className="me-2">{rating.user_name}</strong>
                              <div>{renderStars(rating.rating)}</div>
                            </div>
                            <small className="text-muted">
                              {new Date(rating.created_at).toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                );
              })()}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>Quick Actions</Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" onClick={() => window.history.back()}>
                  ← Back to Stores
                </Button>
                {user && (
                  <Button
                    variant="primary"
                    onClick={() => setShowRatingForm(!showRatingForm)}
                    disabled={showRatingForm}
                  >
                    {userRating ? 'Update Rating' : 'Rate This Store'}
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StoreDetails;
