import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const UserForm = () => {
  const { user: currentUser } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      setFetchLoading(true);
      const response = await api.get(`/users/${id}`);
      const userData = response.data;

      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        address: userData.address || '',
        role: userData.role || 'user'
      });
    } catch (error) {
      setError('Failed to load user data');
      console.error('User fetch error:', error);
    } finally {
      setFetchLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchUser();
    } else {
      setFetchLoading(false);
    }
  }, [id, fetchUser]);

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
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!formData.role) {
      errors.role = 'Role is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/users/${id}`, formData);
        setSuccess('User updated successfully!');
      } else {
        await api.post('/users', formData);
        setSuccess('User created successfully!');
        // Reset form for new user creation
        setFormData({
          name: '',
          email: '',
          address: '',
          role: 'user'
        });
      }

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/users');
      }, 1500);

    } catch (error) {
      const errorMessage = error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} user`;
      setError(errorMessage);
      console.error('User save error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if current user has permission to edit users
  const canEditUsers = currentUser?.role === 'admin';
  const canEditRole = currentUser?.role === 'admin';

  if (!canEditUsers) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  if (fetchLoading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Loading user data...</p>
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
                {isEdit ? 'Edit User' : 'Create New User'}
              </h3>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.name}
                    placeholder="Enter full name"
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
                    placeholder="Enter email address"
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
                    placeholder="Enter address"
                    rows={3}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.address}
                  </Form.Control.Feedback>
                </Form.Group>

                {canEditRole && (
                  <Form.Group className="mb-3">
                    <Form.Label>Role *</Form.Label>
                    <Form.Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      isInvalid={!!validationErrors.role}
                      required
                    >
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.role}
                    </Form.Control.Feedback>
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
                        {isEdit ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      isEdit ? 'Update User' : 'Create User'
                    )}
                  </Button>

                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/users')}
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

export default UserForm;
