import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer style={{
    background: "#111",
    color: "#bbb",
    textAlign: "center",
    padding: "1.5rem 0",
    marginTop: "3rem",
    fontSize: "0.95rem",
    position: "fixed",
    left: 0,
    bottom: 0,
    width: "100%",
    zIndex: 100
  }}>
    <span>
      © {new Date().getFullYear()} RateMyJudge &nbsp;|&nbsp; 
      <Link to="/terms" style={{ color: "#bbb", textDecoration: "underline" }}>Terms of Service</Link>
    </span>
  </footer>
);

export default Footer;
