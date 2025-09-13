import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const StoreForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: user?.id || ''
  });

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const fetchStore = useCallback(async () => {
    try {
      setFetchLoading(true);
      const response = await api.get(`/stores/${id}`);
      const store = response.data.store || response.data;

      // Check if user can edit this store
      if (user?.role !== 'admin' && store.owner_id !== user?.id) {
        setError('You do not have permission to edit this store');
        return;
      }

      setFormData({
        name: store.name || '',
        email: store.email || '',
        address: store.address || '',
        owner_id: store.owner_id || user?.id || ''
      });
    } catch (error) {
      setError('Failed to load store data');
      console.error('Store fetch error:', error);
    } finally {
      setFetchLoading(false);
    }
  }, [id, user?.role, user?.id]);

  useEffect(() => {
    if (isEditing) {
      fetchStore();
    }
  }, [isEditing, fetchStore, id, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Store name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        await api.put(`/stores/${id}`, formData);
      } else {
        await api.post('/stores', formData);
      }

      navigate('/stores');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to save store';
      setError(errorMessage);
      console.error('Store save error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check permissions
  const canAccessForm = () => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'store_owner' && !isEditing) return true;
    return false;
  };

  if (!canAccessForm()) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          You do not have permission to {isEditing ? 'edit' : 'create'} stores.
        </Alert>
      </Container>
    );
  }

  if (fetchLoading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Loading store data...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h3 className="text-center">
                {isEditing ? 'Edit Store' : 'Add New Store'}
              </h3>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Store Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.name}
                    placeholder="Enter store name"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.email}
                    placeholder="Enter store email"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address *</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.address}
                    placeholder="Enter store address"
                    rows={3}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.address}
                  </Form.Control.Feedback>
                </Form.Group>

                {user?.role === 'admin' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Owner ID</Form.Label>
                    <Form.Control
                      type="number"
                      name="owner_id"
                      value={formData.owner_id}
                      onChange={handleChange}
                      placeholder="Enter owner ID"
                    />
                    <Form.Text className="text-muted">
                      Leave empty to assign to current user
                    </Form.Text>
                  </Form.Group>
                )}

                <div className="d-flex gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="flex-fill"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        {isEditing ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      isEditing ? 'Update Store' : 'Create Store'
                    )}
                  </Button>

                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/stores')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StoreForm;
