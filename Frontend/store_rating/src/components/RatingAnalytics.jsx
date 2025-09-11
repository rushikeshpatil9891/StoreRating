import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Alert, Spinner, ProgressBar, ListGroup } from 'react-bootstrap';
import api from '../services/api';

const RatingAnalytics = ({ storeId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      if (storeId) {
        // Fetch analytics for specific store
        const [ratingsResponse, distributionResponse] = await Promise.all([
          api.get(`/ratings/store/${storeId}`),
          api.get(`/ratings/store/${storeId}/distribution`)
        ]);

        const ratings = ratingsResponse.data;
        const distribution = distributionResponse.data;

        // Calculate analytics
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0
          ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings
          : 0;

        // Calculate rating distribution percentages
        const distributionPercentages = {};
        for (let i = 1; i <= 5; i++) {
          distributionPercentages[i] = totalRatings > 0
            ? ((distribution[i] || 0) / totalRatings) * 100
            : 0;
        }

        // Calculate recent ratings (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRatings = ratings.filter(rating =>
          new Date(rating.created_at) > thirtyDaysAgo
        );

        setAnalytics({
          totalRatings,
          averageRating,
          distribution: distributionPercentages,
          recentRatings: recentRatings.length,
          ratings: ratings.slice(0, 10) // Show latest 10 ratings
        });
      } else {
        // Fetch user's rating analytics
        const response = await api.get('/ratings/user/analytics');
        setAnalytics(response.data);
      }
    } catch (error) {
      setError('Failed to load rating analytics');
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const renderStars = (rating, size = 'sm') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className={`text-warning fs-${size}`}>★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className={`text-warning fs-${size}`}>☆</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className={`text-muted fs-${size}`}>☆</span>);
    }

    return stars;
  };

  const renderRatingDistribution = () => {
    if (!analytics?.distribution) return null;

    return (
      <div>
        <h6>Rating Distribution</h6>
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="d-flex align-items-center mb-2">
            <div className="me-2" style={{ minWidth: '60px' }}>
              {rating} star{rating !== 1 ? 's' : ''}
            </div>
            <div className="flex-grow-1 me-2">
              <ProgressBar
                now={analytics.distribution[rating]}
                variant="warning"
                style={{ height: '8px' }}
              />
            </div>
            <div style={{ minWidth: '40px', textAlign: 'right' }}>
              {analytics.distribution[rating].toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" />
        <p className="mt-2">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!analytics) {
    return <Alert variant="info">No rating data available.</Alert>;
  }

  return (
    <div>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div className="fs-2 mb-2">
                {renderStars(analytics.averageRating, '4')}
              </div>
              <div className="fs-3 fw-bold">
                {analytics.averageRating.toFixed(1)}
              </div>
              <div className="text-muted">Average Rating</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div className="fs-2 mb-2 text-primary">
                {analytics.totalRatings}
              </div>
              <div className="text-muted">Total Reviews</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div className="fs-2 mb-2 text-success">
                {analytics.recentRatings || 0}
              </div>
              <div className="text-muted">Recent Reviews</div>
              <small className="text-muted">(Last 30 days)</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div className="fs-2 mb-2 text-info">
                {analytics.averageRating >= 4 ? 'Excellent' :
                 analytics.averageRating >= 3 ? 'Good' :
                 analytics.averageRating >= 2 ? 'Fair' : 'Poor'}
              </div>
              <div className="text-muted">Overall Rating</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6>Rating Breakdown</h6>
            </Card.Header>
            <Card.Body>
              {renderRatingDistribution()}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6>Recent Reviews</h6>
            </Card.Header>
            <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {analytics.ratings && analytics.ratings.length > 0 ? (
                <ListGroup variant="flush">
                  {analytics.ratings.map((rating) => (
                    <ListGroup.Item key={rating.id}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-1">
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
              ) : (
                <p className="text-muted mb-0">No reviews yet.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RatingAnalytics;
