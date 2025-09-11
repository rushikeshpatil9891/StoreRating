import React from 'react';
import { Container } from 'react-bootstrap';
import Navigation from './Navigation.jsx';

const Layout = ({ children }) => {
  return (
    <div>
      <Navigation />
      <Container>
        {children}
      </Container>
    </div>
  );
};

export default Layout;
