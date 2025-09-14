import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Card, Alert, Container, Row, Col, Spinner, Form, InputGroup, Badge, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const UserList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [roleUpdateLoading, setRoleUpdateLoading] = useState(false);

  const usersPerPage = 10;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: usersPerPage,
        search: searchTerm,
        role: roleFilter
      };

      const response = await api.get('/users', { params });
      setUsers(response.data.users || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      setError('Failed to load users');
      console.error('Users fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, roleFilter]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return;

    try {
      setRoleUpdateLoading(true);
      await api.put(`/users/${selectedUser.id}`, { role: newRole });

      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === selectedUser.id ? { ...u, role: newRole } : u
        )
      );

      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole('');
    } catch (error) {
      setError('Failed to update user role');
      console.error('Role update error:', error);
    } finally {
      setRoleUpdateLoading(false);
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'manager': return 'warning';
      case 'user': return 'primary';
      default: return 'secondary';
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <div className="d-flex justify-content-between align-items-center">
                <h3>User Management</h3>
                <Button
                  variant="primary"
                  onClick={() => navigate('/users/new')}
                >
                  <i className="fas fa-plus me-2"></i>
                  Create User
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              {/* Search and Filter Controls */}
              <Row className="mb-4">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">User</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Button
                    variant="outline-primary"
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('');
                      setCurrentPage(1);
                    }}
                    className="w-100"
                  >
                    Clear
                  </Button>
                </Col>
              </Row>

              {/* Users Table */}
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" />
                  <p className="mt-2">Loading users...</p>
                </div>
              ) : (
                <>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Address</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <Badge bg={getRoleBadgeVariant(user.role)}>
                              {user.role}
                            </Badge>
                          </td>
                          <td>{user.address || 'N/A'}</td>
                          <td>
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => openRoleModal(user)}
                              className="me-2"
                            >
                              <i className="fas fa-edit"></i> Edit Role
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => navigate(`/users/${user.id}/edit`)}
                            >
                              <i className="fas fa-user-edit"></i> Edit User
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {filteredUsers.length === 0 && (
                    <div className="text-center mt-4">
                      <p className="text-muted">No users found matching your criteria.</p>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <Button
                        variant="outline-primary"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="me-2"
                      >
                        Previous
                      </Button>
                      <span className="align-self-center mx-3">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline-primary"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Role Change Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <p><strong>User:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Current Role:</strong> {selectedUser.role}</p>

              <Form.Group className="mt-3">
                <Form.Label>New Role</Form.Label>
                <Form.Select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRoleModal(false)}
            disabled={roleUpdateLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRoleChange}
            disabled={roleUpdateLoading || newRole === selectedUser?.role}
          >
            {roleUpdateLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              'Update Role'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserList;
