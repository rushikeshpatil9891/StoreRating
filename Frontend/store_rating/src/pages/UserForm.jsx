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
    password: '',
    role: 'normal_user'
  });
  const [storeFormData, setStoreFormData] = useState({
    name: '',
    email: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [userType, setUserType] = useState('normal'); // 'normal', 'admin', 'store_owner'
  const [isEdit, setIsEdit] = useState(false);
  const [storeId, setStoreId] = useState(null);

  const fetchUser = useCallback(async () => {
    try {
      setFetchLoading(true);
      const response = await api.get(`/users/${id}`);
      const userData = response.data.user; // Access the user object from the response

      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        address: userData.address || '',
        password: '', // Don't populate password for security
        role: userData.role || 'normal_user'
      });

      // Set user type based on role for editing
      if (userData.role === 'admin') {
        setUserType('admin');
      } else if (userData.role === 'store_owner') {
        setUserType('store_owner');
        
        // Fetch store data for store owner
        try {
          const storeResponse = await api.get(`/stores/owner/${id}`);
          
          if (storeResponse.data.stores && storeResponse.data.stores.length > 0) {
            const storeData = storeResponse.data.stores[0]; // Get the first store (assuming one store per owner)
            
            setStoreId(storeData.id);
            setStoreFormData({
              name: storeData.name || '',
              email: storeData.email || '',
              address: storeData.address || ''
            });
          }
        } catch (storeError) {
          console.error('Error fetching store data:', storeError);
          // Don't fail the whole operation if store fetch fails
        }
      } else {
        setUserType('normal');
      }
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

  useEffect(() => {
    if (!isEdit) {
      setFormData(prev => ({
        ...prev,
        role: userType === 'admin' ? 'admin' : userType === 'store_owner' ? 'store_owner' : 'normal_user'
      }));
    }
  }, [userType, isEdit]);

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

  const handleStoreChange = (e) => {
    const { name, value } = e.target;
    setStoreFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field
    if (validationErrors[`store_${name}`]) {
      setValidationErrors(prev => ({
        ...prev,
        [`store_${name}`]: ''
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

    // Password is required only for new users, optional for editing
    if (!isEdit) {
      if (!formData.password.trim()) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
      }
    } else {
      // For editing, if password is provided, validate its length
      if (formData.password.trim() && formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
      }
    }

    if (!formData.role) {
      errors.role = 'Role is required';
    }

    // Validate store fields if user type is store_owner
    if (userType === 'store_owner') {
      if (!storeFormData.name.trim()) {
        errors.store_name = 'Store name is required';
      }

      if (!storeFormData.email.trim()) {
        errors.store_email = 'Store email is required';
      } else if (!/\S+@\S+\.\S+/.test(storeFormData.email)) {
        errors.store_email = 'Store email is invalid';
      }

      if (!storeFormData.address.trim()) {
        errors.store_address = 'Store address is required';
      }
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
        // For editing, only include password if it's provided
        const updateData = {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          role: formData.role
        };

        if (formData.password.trim()) {
          updateData.password = formData.password;
        }

        await api.put(`/users/${id}`, updateData);

        // If user is a store owner and we have store data, also update the store
        if (userType === 'store_owner' && storeId) {
          const storeUpdateData = {
            name: storeFormData.name,
            email: storeFormData.email,
            address: storeFormData.address
          };

          await api.put(`/stores/${storeId}`, storeUpdateData);
        }

        setSuccess('User updated successfully!');
      } else {
        let endpoint = '/users';
        let requestData = formData;

        if (userType === 'normal') {
          endpoint = '/users/normal';
          requestData = {
            name: formData.name,
            email: formData.email,
            address: formData.address,
            password: formData.password
          };
        } else if (userType === 'admin') {
          endpoint = '/users/admin';
          requestData = {
            name: formData.name,
            email: formData.email,
            address: formData.address,
            password: formData.password
          };
        } else if (userType === 'store_owner') {
          endpoint = '/users/store-owner';
          requestData = {
            name: formData.name,
            email: formData.email,
            address: formData.address,
            password: formData.password,
            storeName: storeFormData.name,
            storeEmail: storeFormData.email,
            storeAddress: storeFormData.address
          };
        }

        await api.post(endpoint, requestData);

        if (userType === 'store_owner') {
          setSuccess('Store owner and store created successfully!');
        } else {
          setSuccess(`${userType === 'admin' ? 'Admin' : 'Normal'} user created successfully!`);
        }

        // Reset form for new user creation
        setFormData({
          name: '',
          email: '',
          address: '',
          password: '',
          role: userType === 'admin' ? 'admin' : userType === 'store_owner' ? 'store_owner' : 'normal_user'
        });
        setStoreFormData({
          name: '',
          email: '',
          address: ''
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
                {isEdit ? 'Edit User' : `Create ${userType === 'admin' ? 'Admin' : userType === 'store_owner' ? 'Store Owner' : 'Normal'} User`}
              </h3>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                {!isEdit && (
                  <Form.Group className="mb-4">
                    <Form.Label>User Type</Form.Label>
                    <div className="d-flex gap-2">
                      <Button
                        variant={userType === 'normal' ? 'primary' : 'outline-primary'}
                        onClick={() => setUserType('normal')}
                        type="button"
                      >
                        Normal User
                      </Button>
                      <Button
                        variant={userType === 'admin' ? 'primary' : 'outline-primary'}
                        onClick={() => setUserType('admin')}
                        type="button"
                      >
                        Admin User
                      </Button>
                      <Button
                        variant={userType === 'store_owner' ? 'primary' : 'outline-primary'}
                        onClick={() => setUserType('store_owner')}
                        type="button"
                      >
                        Store Owner
                      </Button>
                    </div>
                  </Form.Group>
                )}
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

                <Form.Group className="mb-3">
                  <Form.Label>Password {isEdit ? '(Leave blank to keep current)' : '*'}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.password}
                    placeholder={isEdit ? "Leave blank to keep current password" : "Enter password"}
                    required={!isEdit}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                {canEditRole && isEdit && (
                  <Form.Group className="mb-3">
                    <Form.Label>Role *</Form.Label>
                    <Form.Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      isInvalid={!!validationErrors.role}
                      required
                    >
                      <option value="normal_user">Normal User</option>
                      <option value="store_owner">Store Owner</option>
                      <option value="admin">Admin</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.role}
                    </Form.Control.Feedback>
                  </Form.Group>
                )}

                {userType === 'store_owner' && (
                  <>
                    <hr />
                    <h5 className="mb-3">Store Information</h5>
                    <Form.Group className="mb-3">
                      <Form.Label>Store Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={storeFormData.name}
                        onChange={handleStoreChange}
                        isInvalid={!!validationErrors.store_name}
                        placeholder="Enter store name"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.store_name}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Store Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={storeFormData.email}
                        onChange={handleStoreChange}
                        isInvalid={!!validationErrors.store_email}
                        placeholder="Enter store email"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.store_email}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Store Address *</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="address"
                        value={storeFormData.address}
                        onChange={handleStoreChange}
                        isInvalid={!!validationErrors.store_address}
                        placeholder="Enter store address"
                        rows={3}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.store_address}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </>
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
                        {isEdit ? 'Updating...' : `Creating ${userType === 'admin' ? 'Admin' : userType === 'store_owner' ? 'Store Owner' : 'User'}...`}
                      </>
                    ) : (
                      isEdit ? 'Update User' : `Create ${userType === 'admin' ? 'Admin' : userType === 'store_owner' ? 'Store Owner' : 'User'}`
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
