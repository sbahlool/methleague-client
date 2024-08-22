import '../style/home'
import '../style/home.css'

const Home = () => (
  <div>
    <div className="background">
      <div className="header">
        <div className="headerWrapper">
          <div className="logo-wrapper">
            <img className="logo" src="/cup.png" alt="cup" />
          </div>
          <br />
          <h1>
            <b className="home-text">Meth League</b> <br /> <i className="home-text-prediction">Prediction.</i>
          </h1>
        </div>
      </div>
    </div>
  </div>
)

export default Home
