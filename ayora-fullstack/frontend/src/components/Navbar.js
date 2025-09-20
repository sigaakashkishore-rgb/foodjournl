import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUtensils, FaSignOutAlt, FaUser, FaUserMd } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="fw-bold">
          <FaUtensils className="me-2" />
          Ayora
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user && (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/add-meal">Add Meal</Nav.Link>
                <Nav.Link as={Link} to="/meals">Meal Journal</Nav.Link>
                <Nav.Link as={Link} to="/upload-image">Food Recognition</Nav.Link>
                <Nav.Link as={Link} to="/voice-recorder">Voice Journal</Nav.Link>
                {user.role === 'doctor' && (
                  <Nav.Link as={Link} to="/doctor">Doctor Panel</Nav.Link>
                )}
              </>
            )}
          </Nav>

          <Nav className="ms-auto">
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                  <FaUser className="me-2" />
                  {user.name}
                  {user.role === 'doctor' && (
                    <FaUserMd className="ms-2 text-info" />
                  )}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">
                    <FaUser className="me-2" />
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-flex gap-2">
                <Button variant="outline-primary" as={Link} to="/login">
                  Login
                </Button>
                <Button variant="primary" as={Link} to="/register">
                  Register
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
