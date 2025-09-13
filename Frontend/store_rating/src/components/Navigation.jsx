import React from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>Store Rating System</Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated && (
              <>
                <LinkContainer to="/dashboard">
                  <Nav.Link>Dashboard</Nav.Link>
                </LinkContainer>

                {user?.role !== 'store_owner' && (
                  <LinkContainer to="/stores">
                    <Nav.Link>Stores</Nav.Link>
                  </LinkContainer>
                )}

                {user?.role !== 'store_owner' && user?.role !== 'admin' && (
                  <LinkContainer to="/ratings/history">
                    <Nav.Link>My Ratings</Nav.Link>
                  </LinkContainer>
                )}

                <LinkContainer to="/profile">
                  <Nav.Link>Profile</Nav.Link>
                </LinkContainer>

                {user?.role === 'store_owner' && (
                  <LinkContainer to="/ratings/manage">
                    <Nav.Link>Manage Ratings</Nav.Link>
                  </LinkContainer>
                )}

                {user?.role === 'admin' && (
                  <>
                    <LinkContainer to="/users">
                      <Nav.Link>Users</Nav.Link>
                    </LinkContainer>
                    <LinkContainer to="/users/analytics">
                      <Nav.Link>Analytics</Nav.Link>
                    </LinkContainer>
                  </>
                )}
              </>
            )}
          </Nav>

          <Nav>
            {isAuthenticated ? (
              <div className="d-flex align-items-center">
                <span className="text-light me-3">
                  Welcome, {user?.name}
                </span>
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>Login</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Nav.Link>Register</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
