import React, { useState } from 'react';
import { Card, Button, Container, Row, Col, Spinner, Alert, Form, ProgressBar } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const DataExport = () => {
  const { user } = useAuth();
  const [exportType, setExportType] = useState('users');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    setProgress(0);

    try {
      const params = {
        type: exportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await api.get('/export/data', {
        params,
        responseType: 'blob'
      });

      clearInterval(progressInterval);
      setProgress(100);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const fileName = `${exportType}_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess(`${exportType.charAt(0).toUpperCase() + exportType.slice(1)} data exported successfully!`);
    } catch (error) {
      setError('Export failed. Please try again.');
      console.error('Export error:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const exportOptions = [
    { value: 'users', label: 'Users', description: 'Export all user data including profiles and roles' },
    { value: 'stores', label: 'Stores', description: 'Export all store information and details' },
    { value: 'ratings', label: 'Ratings', description: 'Export all ratings and reviews data' },
    { value: 'analytics', label: 'Analytics', description: 'Export system analytics and statistics' }
  ];

  if (user?.role !== 'admin') {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h3>Data Export</h3>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form.Group className="mb-4">
                <Form.Label><strong>Select Data Type to Export:</strong></Form.Label>
                {exportOptions.map(option => (
                  <Form.Check
                    key={option.value}
                    type="radio"
                    id={option.value}
                    name="exportType"
                    label={
                      <div>
                        <strong>{option.label}</strong>
                        <br />
                        <small className="text-muted">{option.description}</small>
                      </div>
                    }
                    value={option.value}
                    checked={exportType === option.value}
                    onChange={(e) => setExportType(e.target.value)}
                    className="mb-3"
                  />
                ))}
              </Form.Group>

              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Start Date (Optional)</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                    <Form.Text className="text-muted">
                      Leave empty to export all data
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>End Date (Optional)</Form.Label>
                    <Form.Control
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                    <Form.Text className="text-muted">
                      Leave empty to export all data
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              {loading && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Exporting data...</span>
                    <span>{progress}%</span>
                  </div>
                  <ProgressBar now={progress} animated />
                </div>
              )}

              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleExport}
                  disabled={loading}
                  className="flex-fill"
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-download me-2"></i>
                      Export {exportOptions.find(opt => opt.value === exportType)?.label}
                    </>
                  )}
                </Button>

                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setDateRange({ startDate: '', endDate: '' });
                    setExportType('users');
                  }}
                  disabled={loading}
                >
                  Reset
                </Button>
              </div>

              <Alert variant="info" className="mt-4">
                <h6><i className="fas fa-info-circle me-2"></i>Export Information</h6>
                <ul className="mb-0">
                  <li>Data will be exported in CSV format</li>
                  <li>All dates are in YYYY-MM-DD format</li>
                  <li>Sensitive information is excluded from exports</li>
                  <li>Large exports may take several minutes to complete</li>
                </ul>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DataExport;
