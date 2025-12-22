// src/components/Header.jsx
import { NavLink } from "react-router-dom";
import pages from "../data/pages.json";
import "../styles/components/header.css";

export default function Header() {
  return (
    <header className="site-header">
      <nav className="nav">
        {pages.map((page) => (
          <NavLink key={page.path} to={page.path} end={page.path === "/"}>
            {page.title}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
