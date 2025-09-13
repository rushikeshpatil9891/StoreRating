import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Button, ListGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading dashboard...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const renderAdminDashboard = () => (
    <div>
      <h2>Admin Dashboard</h2>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>{dashboardData.statistics.total_users}</Card.Title>
              <Card.Text>Total Users</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>{dashboardData.statistics.total_stores}</Card.Title>
              <Card.Text>Total Stores</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>{dashboardData.statistics.total_ratings}</Card.Title>
              <Card.Text>Total Ratings</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>{parseFloat(dashboardData.statistics.average_rating)?.toFixed(1) || '0.0'}</Card.Title>
              <Card.Text>Average Rating</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>Recent Users</Card.Header>
            <ListGroup variant="flush">
              {dashboardData.recent_activity.users.slice(0, 5).map((user) => (
                <ListGroup.Item key={user.id}>
                  {user.name} - {user.email}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>Recent Stores</Card.Header>
            <ListGroup variant="flush">
              {dashboardData.recent_activity.stores.slice(0, 5).map((store) => (
                <ListGroup.Item key={store.id}>
                  {store.name} - {store.email}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      {/* User Management Section */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Registration</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={12}>
                  <h6>Create New Users</h6>
                  <p className="text-muted">Register users with different roles</p>
                  <div className="d-flex flex-column gap-2">
                    <Button 
                      variant="success" 
                      onClick={() => navigate('/users/new?role=normal_user')}
                      className="w-100"
                    >
                      👤 Register User
                    </Button>
                    <Button 
                      variant="danger" 
                      onClick={() => navigate('/users/new?role=admin')}
                      className="w-100"
                    >
                      👤 Register Admin
                    </Button>
                    <Button 
                      variant="warning" 
                      onClick={() => navigate('/users/new?role=store_owner')}
                      className="w-100"
                    >
                      👨‍💼 Register Store Owner
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderStoreOwnerDashboard = () => (
    <div>
      <h2>Store Owner Dashboard</h2>
      
      {/* Overview Statistics */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>{dashboardData.overview?.total_stores || 0}</Card.Title>
              <Card.Text>My Stores</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>{dashboardData.overview?.total_ratings || 0}</Card.Title>
              <Card.Text>Total Ratings</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>{parseFloat(dashboardData.overview?.average_rating)?.toFixed(1) || '0.0'}</Card.Title>
              <Card.Text>Average Rating</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Individual Store Details */}
      {dashboardData.stores && dashboardData.stores.length > 0 ? (
        <div>
          <h3>My Stores</h3>
          <Row>
            {dashboardData.stores.map((store) => (
              <Col md={6} key={store.id} className="mb-4">
                <Card>
                  <Card.Header>
                    <strong>{store.name}</strong>
                    <div className="float-end">
                      ⭐ {parseFloat(store.average_rating)?.toFixed(1) || '0.0'} 
                      ({store.total_ratings || 0} ratings)
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-3">
                      <Col sm={6}>
                        <strong>Address:</strong><br />
                        {store.address}
                      </Col>
                      <Col sm={6}>
                        <strong>Phone:</strong><br />
                        {store.phone || 'Not provided'}
                      </Col>
                    </Row>
                    
                    {/* Rating Distribution */}
                    {store.statistics?.distribution && (
                      <div className="mb-3">
                        <strong>Rating Distribution:</strong>
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="d-flex align-items-center mb-1">
                            <span className="me-2" style={{ minWidth: '20px' }}>{rating}⭐</span>
                            <div className="progress flex-grow-1" style={{ height: '8px' }}>
                              <div 
                                className="progress-bar bg-warning" 
                                style={{ 
                                  width: `${store.total_ratings > 0 ? (store.statistics.distribution[rating] || 0) / store.total_ratings * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                            <span className="ms-2" style={{ minWidth: '30px' }}>
                              {store.statistics.distribution[rating] || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Recent Ratings */}
                    {store.recent_ratings && store.recent_ratings.length > 0 && (
                      <div>
                        <strong>Recent Ratings:</strong>
                        <ListGroup variant="flush" className="mt-2">
                          {store.recent_ratings.slice(0, 3).map((rating) => (
                            <ListGroup.Item key={rating.id} className="py-2">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <div>
                                  <strong>{rating.user_name || 'Anonymous'}</strong>
                                  <span className="ms-2">⭐ {rating.rating}/5</span>
                                </div>
                                <small className="text-muted">
                                  {new Date(rating.created_at).toLocaleDateString()}
                                </small>
                              </div>
                              {rating.comment && (
                                <small className="text-muted d-block mt-1">
                                  "{rating.comment}"
                                </small>
                              )}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>
                    )}
                  </Card.Body>
                  <Card.Footer>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => navigate(`/stores/${store.id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline-success" 
                      size="sm" 
                      className="ms-2"
                      onClick={() => navigate('/ratings/manage')}
                    >
                      Manage Ratings
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <Card className="text-center">
          <Card.Body>
            <Card.Text>No stores found. Create your first store to get started!</Card.Text>
            <Button variant="primary" onClick={() => navigate('/stores/new')}>
              Add New Store
            </Button>
          </Card.Body>
        </Card>
      )}
    </div>
  );

  const renderNormalUserDashboard = () => (
    <div>
      <h2>User Dashboard</h2>

      {/* User Statistics Overview */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>{dashboardData.my_ratings?.total_ratings || 0}</Card.Title>
              <Card.Text>Total Ratings Given</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>{dashboardData.discover?.popular_stores?.length || 0}</Card.Title>
              <Card.Text>Stores to Discover</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>
                {dashboardData.my_ratings?.ratings?.length > 0
                  ? (dashboardData.my_ratings.ratings.reduce((sum, rating) => sum + rating.user_rating, 0) / dashboardData.my_ratings.ratings.length).toFixed(1)
                  : '0.0'
                }
              </Card.Title>
              <Card.Text>Average Rating Given</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity and Discovery */}
      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <strong>My Recent Ratings</strong>
              <Button
                variant="link"
                size="sm"
                className="float-end p-0"
                onClick={() => navigate('/ratings/history')}
              >
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              {dashboardData.my_ratings?.ratings?.length > 0 ? (
                <div>
                  {dashboardData.my_ratings.ratings.slice(0, 5).map((rating) => (
                    <div key={rating.id} className="mb-3 pb-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{rating.name}</strong>
                          <div className="text-muted small">{rating.address}</div>
                        </div>
                        <div className="text-end">
                          <div className="text-warning">
                            {'★'.repeat(rating.user_rating)}{'☆'.repeat(5 - rating.user_rating)}
                          </div>
                          <div className="text-muted small">
                            {new Date(rating.rated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <p>You haven't rated any stores yet.</p>
                  <Button variant="primary" onClick={() => navigate('/stores')}>
                    Start Rating Stores
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <strong>Discover Popular Stores</strong>
              <Button
                variant="link"
                size="sm"
                className="float-end p-0"
                onClick={() => navigate('/stores')}
              >
                Browse All
              </Button>
            </Card.Header>
            <Card.Body>
              {dashboardData.discover?.popular_stores?.length > 0 ? (
                <div>
                  {dashboardData.discover.popular_stores.slice(0, 5).map((store) => (
                    <div key={store.id} className="mb-3 pb-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{store.name}</strong>
                          <div className="text-muted small">{store.address}</div>
                        </div>
                        <div className="text-end">
                          <div className="text-warning">
                            {'★'.repeat(Math.floor(store.average_rating || 0))}{'☆'.repeat(5 - Math.floor(store.average_rating || 0))}
                          </div>
                          <div className="text-muted small">
                            {store.total_ratings || 0} reviews
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/stores/${store.id}`)}
                      >
                        View & Rate
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <p>No new stores to discover right now.</p>
                  <Button variant="primary" onClick={() => navigate('/stores')}>
                    Browse All Stores
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <div>
      {user?.role === 'admin' && renderAdminDashboard()}
      {user?.role === 'store_owner' && renderStoreOwnerDashboard()}
      {user?.role === 'normal_user' && renderNormalUserDashboard()}
    </div>
  );
};

export default Dashboard;
