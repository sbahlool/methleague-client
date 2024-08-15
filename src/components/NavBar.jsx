import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '../style/nav.css'

const NavBar = ({ user, handleLogOut }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [isMenuOpen, setMenuOpen] = useState(false)

  const toggleDropdown = (event) => {
    event.preventDefault()
    setDropdownOpen(!isDropdownOpen)
  }

  const closeDropdown = (event) => {
    if (!event.target.closest('.navbar-dropdown')) {
      setDropdownOpen(false)
    }
  }

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen)
  }

  useEffect(() => {
    document.addEventListener('mouseup', closeDropdown)
    return () => {
      document.removeEventListener('mouseup', closeDropdown)
    }
  }, [])

  const userOptions = user && (
    <ul className="navbar-nav">
      <li className="navbar-dropdown">
        <NavLink to="#" className="dropdown-toggler" onClick={toggleDropdown}>
          Welcome, {user.username}! <i className="fa fa-angle-down"></i>
        </NavLink>
        <ul className={`dropdown ${isDropdownOpen ? 'show' : ''}`}>
          <li>
            <NavLink className="navitem" to={`/profile/${user.username}`}>
              Profile
            </NavLink>
          </li>
          <li className="separator"></li>
          <li>
            <NavLink className="navitem" onClick={handleLogOut} to="/">
              Logout
            </NavLink>
          </li>
        </ul>
      </li>
    </ul>
  )

  const visitorOptions = (
    <ul className="navbar-nav">
      <li>
        <NavLink to="/login">Sign in</NavLink>
      </li>
      <li>
        <NavLink to="/register">
          <button className="btn btn-outline-purple">Join</button>
        </NavLink>
      </li>
    </ul>
  )

  return (
    <header>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-header">
            <NavLink to="/">
              <div className="logo-wrapper">
                <img className="logo" src="/logo.png" alt="Logo" />
              </div>
            </NavLink>
          </div>

          <button className="navbar-toggler" onClick={toggleMenu}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>

          <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
            <ul className="navbar-nav">
              <li>
                <NavLink to="/">Home</NavLink>
              </li>
              <li>
                <NavLink to="/table">League Table</NavLink>
              </li>
              <li>
                <NavLink to="/rank">Rank</NavLink>
              </li>
              <li>
                <NavLink to="/schedule">Schedule</NavLink>
              </li>
              {user && user.role === 'admin' && (
                <>
                  <li>
                    <NavLink to="/admin">Admin Page</NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin-predictions">Admin Predictions</NavLink>
                  </li>
                </>
              )}
              {user ? userOptions : visitorOptions}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default NavBar
