import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Spinner, Alert, ProgressBar, Badge, Table } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const SystemMonitoring = () => {
  const { user } = useAuth();
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchSystemStats();
      const interval = setInterval(fetchSystemStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [user, refreshInterval]);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/system/stats');
      setSystemStats(response.data);
    } catch (error) {
      setError('Failed to load system statistics');
      console.error('System stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'healthy': return <Badge bg="success">Healthy</Badge>;
      case 'warning': return <Badge bg="warning">Warning</Badge>;
      case 'critical': return <Badge bg="danger">Critical</Badge>;
      default: return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const getUsageColor = (percentage) => {
    if (percentage < 50) return 'success';
    if (percentage < 80) return 'warning';
    return 'danger';
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

  if (loading && !systemStats) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Loading system statistics...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>System Monitoring</h2>
            <div className="d-flex align-items-center gap-2">
              <small className="text-muted">Auto-refresh:</small>
              <select
                className="form-select form-select-sm"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                style={{ width: 'auto' }}
              >
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
                <option value={60000}>1m</option>
                <option value={300000}>5m</option>
              </select>
            </div>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {systemStats && (
        <>
          {/* System Health Overview */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  {getStatusBadge(systemStats.overallHealth)}
                  <h4 className="mt-2">System Status</h4>
                  <p className="text-muted small">Overall health</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-primary">{systemStats.uptime}</h3>
                  <p className="text-muted small">Uptime</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-success">{systemStats.activeUsers}</h3>
                  <p className="text-muted small">Active Users</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-info">{systemStats.totalRequests}</h3>
                  <p className="text-muted small">Total Requests</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Resource Usage */}
          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>Memory Usage</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between">
                      <span>RAM Usage</span>
                      <span>{systemStats.memoryUsage.percentage}%</span>
                    </div>
                    <ProgressBar
                      variant={getUsageColor(systemStats.memoryUsage.percentage)}
                      now={systemStats.memoryUsage.percentage}
                    />
                  </div>
                  <small className="text-muted">
                    {systemStats.memoryUsage.used} / {systemStats.memoryUsage.total} MB
                  </small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>CPU Usage</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between">
                      <span>CPU Load</span>
                      <span>{systemStats.cpuUsage.percentage}%</span>
                    </div>
                    <ProgressBar
                      variant={getUsageColor(systemStats.cpuUsage.percentage)}
                      now={systemStats.cpuUsage.percentage}
                    />
                  </div>
                  <small className="text-muted">
                    {systemStats.cpuUsage.cores} cores
                  </small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Database Statistics */}
          <Row className="mb-4">
            <Col md={12}>
              <Card>
                <Card.Header>
                  <h5>Database Statistics</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-primary">{systemStats.database.users}</h4>
                        <p className="text-muted small">Total Users</p>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-success">{systemStats.database.stores}</h4>
                        <p className="text-muted small">Total Stores</p>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-warning">{systemStats.database.ratings}</h4>
                        <p className="text-muted small">Total Ratings</p>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center">
                        <h4 className="text-info">{systemStats.database.connections}</h4>
                        <p className="text-muted small">Active Connections</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Recent Activity */}
          <Row className="mb-4">
            <Col md={12}>
              <Card>
                <Card.Header>
                  <h5>Recent Activity</h5>
                </Card.Header>
                <Card.Body>
                  <Table responsive size="sm">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Action</th>
                        <th>User</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {systemStats.recentActivity?.map((activity, index) => (
                        <tr key={index}>
                          <td>
                            <small>{new Date(activity.timestamp).toLocaleTimeString()}</small>
                          </td>
                          <td>
                            <Badge bg="secondary">{activity.action}</Badge>
                          </td>
                          <td>{activity.user}</td>
                          <td className="text-truncate" style={{ maxWidth: '200px' }}>
                            {activity.details}
                          </td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">
                            No recent activity
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* API Performance */}
          <Row>
            <Col md={12}>
              <Card>
                <Card.Header>
                  <h5>API Performance</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <div className="text-center">
                        <h5 className="text-success">{systemStats.apiPerformance.avgResponseTime}ms</h5>
                        <p className="text-muted small">Avg Response Time</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center">
                        <h5 className="text-primary">{systemStats.apiPerformance.requestsPerMinute}</h5>
                        <p className="text-muted small">Requests/Minute</p>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="text-center">
                        <h5 className="text-warning">{systemStats.apiPerformance.errorRate}%</h5>
                        <p className="text-muted small">Error Rate</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default SystemMonitoring;
