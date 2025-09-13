import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Row, Col, Button, Form, Alert, Spinner } from 'react-bootstrap';
import api from '../services/api';
import { Link } from 'react-router-dom';

const StoresList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    limit: 10,
    offset: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1
  });

  // Refs for maintaining focus
  const debounceRef = useRef(null);
  const searchInputRef = useRef(null);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await api.get(`/stores?${params}`);
      setStores(response.data.stores || []);
      setPagination(response.data.pagination || { currentPage: 1, totalPages: 1 });
    } catch (error) {
      setError('Failed to load stores');
      console.error('Stores fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Sync search term with filters
  useEffect(() => {
    setSearchTerm(filters.name);
  }, [filters.name]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback((searchValue) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        name: searchValue,
        offset: 0 // Reset to first page when searching
      }));
      setPagination(prev => ({ ...prev, currentPage: 1 }));

      // Maintain focus on search input after search
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }, 500); // 500ms delay
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Clear any pending debounced search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setFilters(prev => ({
      ...prev,
      name: searchTerm,
      offset: 0
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));

    // Maintain focus on search input after search
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      offset: 0 // Reset to first page when filters change
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    const newOffset = (newPage - 1) * filters.limit;
    setFilters(prev => ({ ...prev, offset: newOffset }));
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const renderStars = (rating) => {
    const numericRating = parseFloat(rating) || 0;
    const stars = [];
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-warning">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="text-warning">☆</span>);
    }

    const emptyStars = 5 - Math.ceil(numericRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-muted">☆</span>);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading stores...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Stores</h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearchSubmit}>
            <Row>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Search by Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Store name..."
                    ref={searchInputRef}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Search by Email</Form.Label>
                  <Form.Control
                    type="text"
                    name="email"
                    value={filters.email}
                    onChange={handleFilterChange}
                    placeholder="Store email..."
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Search by Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={filters.address}
                    onChange={handleFilterChange}
                    placeholder="Store address..."
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>&nbsp;</Form.Label>
                  <div>
                    <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Searching...
                        </>
                      ) : (
                        'Search'
                      )}
                    </Button>
                  </div>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Sort By</Form.Label>
                  <Form.Select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                  >
                    <option value="created_at">Date Created</option>
                    <option value="name">Name</option>
                    <option value="average_rating">Rating</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Stores Grid */}
      <Row>
        {stores.length === 0 ? (
          <Col>
            <Alert variant="info">No stores found matching your criteria.</Alert>
          </Col>
        ) : (
          stores.map((store) => (
            <Col key={store.id} md={6} lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{store.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {store.email}
                  </Card.Subtitle>
                  <Card.Text className="flex-grow-1">
                    <strong>Address:</strong> {store.address}
                  </Card.Text>
                  <div className="mb-2">
                    <strong>Rating:</strong>{' '}
                    {renderStars(parseFloat(store.average_rating) || 0)}
                    <span className="ms-2">
                      ({parseFloat(store.average_rating)?.toFixed(1) || '0.0'})
                    </span>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">
                      {store.total_ratings || 0} reviews
                    </small>
                  </div>
                  <div className="mt-auto">
                    <Link to={`/stores/${store.id}`}>
                      <Button variant="primary" className="w-100">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Button
            variant="outline-primary"
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            className="me-2"
          >
            Previous
          </Button>
          <span className="align-self-center mx-3">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline-primary"
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default StoresList;
