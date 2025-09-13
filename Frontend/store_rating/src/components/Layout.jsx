import React from 'react';
import { Container } from 'react-bootstrap';
import Navigation from './Navigation.jsx';
import Footer from './Footer.jsx';

const Layout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navigation />
      <Container className="flex-grow-1">
        {children}
      </Container>
      <Footer />
    </div>
  );
};

export default Layout;
