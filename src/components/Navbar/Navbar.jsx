import React from 'react';
import './Navbar.scss';

const Navbar = ({ gameState, handleEndGame }) => {
  return (
    <nav className="navbar navbar-inverse navbar-fixed-top" role="navigation">
      <div className="container">
        <div id="navbar">
          <ul className="nav navbar-nav">
            {
              gameState === 'game' ? (
                <li id="nav-choosecharacters">
                  <a href="javascript:;" onClick={handleEndGame}>
                    <span className="glyphicon glyphicon-small glyphicon-arrow-left"></span> Back to menu
                  </a>
                </li>
              ) : <li id="nav-kanaquiz"><p className="nav navbar-text">Kana Kata</p></li>
            }
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
