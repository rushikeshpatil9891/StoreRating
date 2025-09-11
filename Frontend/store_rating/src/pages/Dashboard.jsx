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
    </div>
  );

  const renderStoreOwnerDashboard = () => (
    <div>
      <h2>Store Owner Dashboard</h2>
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>My Stores</Card.Header>
            <Card.Body>
              <p>You can manage your stores and view ratings here.</p>
              <Button variant="primary" onClick={() => navigate('/stores')}>
                View My Stores
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>Rating Management</Card.Header>
            <Card.Body>
              <p>View and manage ratings for your stores.</p>
              <Button variant="success" onClick={() => navigate('/ratings/manage')}>
                Manage Ratings
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderNormalUserDashboard = () => (
    <div>
      <h2>User Dashboard</h2>
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>Browse Stores</Card.Header>
            <Card.Body>
              <p>Discover and rate stores in your area.</p>
              <Button variant="primary" onClick={() => navigate('/stores')}>
                Browse Stores
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>My Ratings</Card.Header>
            <Card.Body>
              <p>View and manage your store ratings.</p>
              <Button variant="success" onClick={() => navigate('/ratings/history')}>
                View My Ratings
              </Button>
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
