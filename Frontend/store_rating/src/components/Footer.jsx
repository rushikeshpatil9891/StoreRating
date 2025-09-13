import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light mt-5 py-4">
      <Container>
        <Row>
          <Col md={4} className="mb-3">
            <h5>Store Rating System</h5>
            <p className="mb-0">
              A comprehensive platform for store owners and customers to connect through ratings and reviews.
            </p>
          </Col>

          <Col md={4} className="mb-3">
            <h6>Quick Links</h6>
            <ul className="list-unstyled">
              <li><a href="/dashboard" className="text-light text-decoration-none">Dashboard</a></li>
              <li><a href="/stores" className="text-light text-decoration-none">Browse Stores</a></li>
              <li><a href="/ratings/history" className="text-light text-decoration-none">My Ratings</a></li>
              <li><a href="/profile" className="text-light text-decoration-none">Profile</a></li>
            </ul>
          </Col>

          <Col md={4} className="mb-3">
            <h6>Contact & Support</h6>
        
            <div className="d-flex gap-3">
              <a href="mailto:rushikeshpatil1277@gmail.com" className="text-light text-decoration-none">
                <img src="/mail.png" alt="Email" style={{width: '40px', height: '40px'}} />
              </a>
              <a href="https://linkedin.com/in/rushikesh-patil" target="_blank" rel="noopener noreferrer" className="text-light text-decoration-none">
                <img src="/linkedin.png" alt="LinkedIn" style={{width: '40px', height: '40px'}} />
              </a>
            </div>
          </Col>
        </Row>

        <hr className="my-3" />

        <Row>
          <Col className="text-center">
            <p className="mb-0">
              &copy; {currentYear} Store Rating System. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;