import { Link } from 'react-router-dom'
import '../style/home.css'

const Home = () => (
  <div>
    <div className="background">
      <div className="header">
        <div className="headerWrapper">
          <div className="logo-wrapper">
            <img className="logo" src="/cup.png" alt="cup" />
          </div>
          <span className="eyebrow">Season 2026/27</span>
          <h1>
            <b className="home-text">Meth League</b>
            <br />
            <i className="home-text-prediction">Prediction.</i>
          </h1>
          <p className="hero-tagline">
            Predict the scores, climb the table, and find out who really knows the game.
          </p>
          <div className="hero-actions">
            <Link className="btn-primary" to="/rank">
              View Rankings
            </Link>
            <Link className="btn-ghost" to="/schedule">
              See Schedule
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default Home
