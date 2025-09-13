import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Container, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const UserAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      console.log('User is admin, fetching data...');
      console.log('User info:', user);
      fetchAnalytics();
      fetchActivityLogs();
    } else {
      console.log('User is not admin or not loaded:', user);
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/analytics');
      setAnalytics(response.data);
    } catch (error) {
      setError('Failed to load user analytics');
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      console.log('Fetching activity logs...');
      const response = await api.get('/activities/recent');
      console.log('Activity logs response:', response);
      console.log('Activity logs data:', response.data);
      setActivityLogs(response.data.activities || []);
      console.log('Activity logs set to state:', response.data.activities || []);
    } catch (error) {
      console.error('Activity logs fetch error:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Loading analytics...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2 className="mb-4">User Analytics</h2>

      {analytics && (
        <Row>
          <Col md={3}>
            <Card className="text-center mb-4">
              <Card.Body>
                <h3 className="text-primary">{analytics.totalUsers}</h3>
                <Card.Text>Total Users</Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="text-center mb-4">
              <Card.Body>
                <h3 className="text-success">{analytics.activeUsers}</h3>
                <Card.Text>Active Users</Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="text-center mb-4">
              <Card.Body>
                <h3 className="text-warning">{analytics.newUsersThisMonth}</h3>
                <Card.Text>New This Month</Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="text-center mb-4">
              <Card.Body>
                <h3 className="text-info">{analytics.averageUsersPerDay}</h3>
                <Card.Text>Avg Daily Users</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {analytics?.roleDistribution && (
        <Card className="mt-4">
          <Card.Header>
            <h5>Role Distribution</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {Object.entries(analytics.roleDistribution).map(([role, count]) => (
                <Col md={4} key={role} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-capitalize">{role}s:</span>
                    <Badge
                      bg={
                        role === 'admin' ? 'danger' :
                        role === 'manager' ? 'warning' : 'primary'
                      }
                    >
                      {count}
                    </Badge>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {analytics?.recentActivity && analytics.recentActivity.length > 0 && (
        <Card className="mt-4">
          <Card.Header>
            <h5>Recent User Activity</h5>
          </Card.Header>
          <Card.Body>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="mb-2 p-2 border rounded">
                  <small className="text-muted">
                    {new Date(activity.timestamp).toLocaleString()}
                  </small>
                  <div>{activity.description}</div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {activityLogs.length > 0 && (
        <Card className="mt-4">
          <Card.Header>
            <h5>User Activity Logs ({activityLogs.length} activities)</h5>
          </Card.Header>
          <Card.Body>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {activityLogs.map((log) => (
                <div key={log.id} className="mb-3 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge
                      bg={
                        log.action === 'USER_REGISTERED' ? 'success' :
                        log.action === 'USER_LOGIN' ? 'info' :
                        log.action === 'RATING_SUBMITTED' ? 'warning' :
                        log.action === 'PROFILE_UPDATED' ? 'primary' :
                        'secondary'
                      }
                    >
                      {log.action.replace('_', ' ')}
                    </Badge>
                    <small className="text-muted">
                      {new Date(log.created_at).toLocaleString()}
                    </small>
                  </div>
                  <div className="mb-1">
                    <strong>{log.user_name}</strong> ({log.user_email})
                  </div>
                  <div className="text-muted small">{log.description}</div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {activityLogs.length === 0 && (
        <Card className="mt-4">
          <Card.Header>
            <h5>User Activity Logs</h5>
          </Card.Header>
          <Card.Body>
            <p className="text-muted">No activity logs found. Check console for API errors.</p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default UserAnalytics;
