import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '../style/nav.css'
import { UserResponse } from '../services/Auth'

interface Props {
  user: UserResponse | null
  handleLogOut: () => void
}

const NavBar = ({ user, handleLogOut }: Props) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [isBurgerVisible, setBurgerVisible] = useState(true)

  const toggleDropdown: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault()
    setDropdownOpen(!isDropdownOpen)
  }

  const closeDropdown = (event: MouseEvent) => {
    if (event.target instanceof Element && !event.target.closest('.navbar-dropdown')) {
      setDropdownOpen(false)
    }
  }

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen)
    setBurgerVisible(!isBurgerVisible)
  }

  const closeMenu = () => {
    setMenuOpen(false)
    setBurgerVisible(true)
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
        <ul className={`dropdown${isDropdownOpen ? ' show' : ''}`}>
          <li>
            <NavLink className="navitem" to={`/profile/${user.username}`} onClick={closeMenu}>
              Profile
            </NavLink>
          </li>
          <li className="separator"></li>
          <li>
            <NavLink
              className="navitem"
              onClick={() => {
                handleLogOut()
                closeMenu()
              }}
              to="/"
            >
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
        <NavLink to="/login" onClick={closeMenu}>
          Sign in
        </NavLink>
      </li>
      <li>
        <NavLink to="/register" onClick={closeMenu}>
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
          {isBurgerVisible && (
            <button className="navbar-toggler" onClick={toggleMenu}>
              <img className="bar" src="/bmenu.png" alt="bmenu" />
            </button>
          )}
            <NavLink to="/" onClick={closeMenu}>
              <div className="logo-wrapper-logo">
                <img className="logo-home" src="/logo.png" alt="Logo" />
              </div>
            </NavLink>
          </div>
          <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
            <ul className="navbar-nav">
              <li>
                <NavLink to="/" onClick={closeMenu}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/table" onClick={closeMenu}>
                  League Table
                </NavLink>
              </li>
              <li>
                <NavLink to="/rank" onClick={closeMenu}>
                  Rank
                </NavLink>
              </li>
              <li>
                <NavLink to="/schedule" onClick={closeMenu}>
                  Schedule
                </NavLink>
              </li>
              <li>
                <NavLink to="/minigame" onClick={closeMenu}>
                  Mini Game
                </NavLink>
              </li>
              {user && user.role === 'admin' && (
                <>
                  <li>
                    <NavLink to="/admin" onClick={closeMenu}>
                      Admin Page
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin-predictions" onClick={closeMenu}>
                      Admin Predictions
                    </NavLink>
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
