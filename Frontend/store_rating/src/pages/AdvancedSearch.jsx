import React, { useState } from 'react';
import { Card, Form, Button, Container, Row, Col, Spinner, Alert, Tabs, Tab, Table, Badge } from 'react-bootstrap';
import api from '../services/api';

const AdvancedSearch = () => {
  const [searchCriteria, setSearchCriteria] = useState({
    query: '',
    type: 'all', // all, stores, ratings, users
    dateFrom: '',
    dateTo: '',
    rating: '',
    role: '',
    category: ''
  });
  const [results, setResults] = useState({
    stores: [],
    ratings: [],
    users: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const params = {
        query: searchCriteria.query,
        type: searchCriteria.type,
        dateFrom: searchCriteria.dateFrom,
        dateTo: searchCriteria.dateTo,
        rating: searchCriteria.rating,
        role: searchCriteria.role,
        category: searchCriteria.category
      };

      const response = await api.get('/search/advanced', { params });
      setResults(response.data);
    } catch (error) {
      setError('Search failed. Please try again.');
      console.error('Advanced search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearSearch = () => {
    setSearchCriteria({
      query: '',
      type: 'all',
      dateFrom: '',
      dateTo: '',
      rating: '',
      role: '',
      category: ''
    });
    setResults({
      stores: [],
      ratings: [],
      users: []
    });
    setError('');
  };

  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'manager': return 'warning';
      case 'store_owner': return 'success';
      case 'user': return 'primary';
      default: return 'secondary';
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h3>Advanced Search</h3>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <Row className="mb-3">
                  <Col md={8}>
                    <Form.Control
                      type="text"
                      placeholder="Search for stores, ratings, users..."
                      value={searchCriteria.query}
                      onChange={(e) => handleInputChange('query', e.target.value)}
                      required
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Select
                      value={searchCriteria.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="stores">Stores Only</option>
                      <option value="ratings">Ratings Only</option>
                      <option value="users">Users Only</option>
                    </Form.Select>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Control
                      type="date"
                      placeholder="From Date"
                      value={searchCriteria.dateFrom}
                      onChange={(e) => handleInputChange('dateFrom', e.target.value)}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      type="date"
                      placeholder="To Date"
                      value={searchCriteria.dateTo}
                      onChange={(e) => handleInputChange('dateTo', e.target.value)}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={searchCriteria.rating}
                      onChange={(e) => handleInputChange('rating', e.target.value)}
                    >
                      <option value="">Any Rating</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="2">2+ Stars</option>
                      <option value="1">1+ Stars</option>
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={searchCriteria.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                    >
                      <option value="">Any Role</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="store_owner">Store Owner</option>
                      <option value="user">User</option>
                    </Form.Select>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Control
                      type="text"
                      placeholder="Store Category"
                      value={searchCriteria.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    />
                  </Col>
                  <Col md={6} className="d-flex gap-2">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                      className="flex-fill"
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Searching...
                        </>
                      ) : (
                        'Search'
                      )}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={clearSearch}
                      disabled={loading}
                    >
                      Clear
                    </Button>
                  </Col>
                </Row>
              </Form>

              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

              {/* Search Results */}
              {(results.stores.length > 0 || results.ratings.length > 0 || results.users.length > 0) && (
                <div className="mt-4">
                  <h4>Search Results</h4>
                  <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                    <Tab eventKey="all" title={`All (${results.stores.length + results.ratings.length + results.users.length})`}>
                      <Row>
                        {results.stores.slice(0, 3).map(store => (
                          <Col md={4} key={`store-${store.id}`} className="mb-3">
                            <Card className="h-100">
                              <Card.Body>
                                <Card.Title className="text-truncate">{store.name}</Card.Title>
                                <Card.Text className="small text-muted">
                                  {store.description?.substring(0, 100)}...
                                </Card.Text>
                                <Badge bg="secondary">Store</Badge>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                        {results.ratings.slice(0, 3).map(rating => (
                          <Col md={4} key={`rating-${rating.id}`} className="mb-3">
                            <Card className="h-100">
                              <Card.Body>
                                <Card.Title>{getRatingStars(rating.rating)}</Card.Title>
                                <Card.Text className="small">
                                  {rating.comment?.substring(0, 80)}...
                                </Card.Text>
                                <Badge bg="primary">Rating</Badge>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                        {results.users.slice(0, 3).map(user => (
                          <Col md={4} key={`user-${user.id}`} className="mb-3">
                            <Card className="h-100">
                              <Card.Body>
                                <Card.Title>{user.name}</Card.Title>
                                <Badge bg={getRoleBadge(user.role)}>{user.role}</Badge>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </Tab>

                    <Tab eventKey="stores" title={`Stores (${results.stores.length})`}>
                      <Table responsive striped hover>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Location</th>
                            <th>Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.stores.map(store => (
                            <tr key={store.id}>
                              <td>{store.name}</td>
                              <td>{store.category || 'N/A'}</td>
                              <td>{store.location || 'N/A'}</td>
                              <td>{store.average_rating ? `${parseFloat(store.average_rating).toFixed(1)} ⭐` : 'No ratings'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Tab>

                    <Tab eventKey="ratings" title={`Ratings (${results.ratings.length})`}>
                      <Table responsive striped hover>
                        <thead>
                          <tr>
                            <th>Store</th>
                            <th>Rating</th>
                            <th>Comment</th>
                            <th>User</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.ratings.map(rating => (
                            <tr key={rating.id}>
                              <td>{rating.store_name}</td>
                              <td>{getRatingStars(rating.rating)}</td>
                              <td className="text-truncate" style={{ maxWidth: '200px' }}>
                                {rating.comment}
                              </td>
                              <td>{rating.user_name}</td>
                              <td>{new Date(rating.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Tab>

                    <Tab eventKey="users" title={`Users (${results.users.length})`}>
                      <Table responsive striped hover>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.users.map(user => (
                            <tr key={user.id}>
                              <td>{user.name}</td>
                              <td>{user.email}</td>
                              <td>
                                <Badge bg={getRoleBadge(user.role)}>{user.role}</Badge>
                              </td>
                              <td>{new Date(user.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Tab>
                  </Tabs>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdvancedSearch;
