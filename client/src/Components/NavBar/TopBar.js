import React, { Component } from 'react';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

class TopBar extends Component {

  handleLoginLink = () => {
    this.props.setView("Login");
  }

  handleLogoutLink = () => {
    this.props.setSigninStatus(false,"");
    this.props.setView("Home");
  }

  handleRegisterLink = () => {
    this.props.setView("Register");
  }

  handleHomeLink = () => {
    this.props.setView("Home");
  }

  render() {
    let loginLink,logoutLink,registerLink;
    if(this.props.signinStatus === true) {
      logoutLink = <Nav.Link href="#home" onSelect={this.handleLogoutLink} >Logout</Nav.Link>;
    }
    else {
      loginLink = <Nav.Link href="#login" onSelect={this.handleLoginLink} >Login</Nav.Link>;
      registerLink = <Nav.Link eventKey={2} href="#register" onSelect={this.handleRegisterLink} >Register</Nav.Link>;
    }

    return(
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" sticky="top">
            <Navbar.Brand href="#home" onClick={this.handleHomeLink} >Issue Redressal</Navbar.Brand>
              <Navbar.Toggle aria-controls="responsive-navbar-nav" />
              <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="mr-auto">
                  <Nav.Link href="#home" onSelect={this.handleHomeLink} >Home</Nav.Link>
                  <Nav.Link href="#features">Features</Nav.Link>
                  <Nav.Link href="#pricing">Pricing</Nav.Link>
                  <NavDropdown title="Dropdown" id="collasible-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                    <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                  </NavDropdown>
                </Nav>
                <Nav>
                  {registerLink}
                  {loginLink}
                  {logoutLink}
                </Nav>
              </Navbar.Collapse>
            </Navbar>
    );
  }
}

export default TopBar;