import React, { useState, useEffect } from 'react';
import './App.scss';
import Navbar from '../Navbar/Navbar';
import GameContainer from '../GameContainer/GameContainer';

const App = () => {
  const [gameState, setGameState] = useState('chooseCharacters');

  const startGame = () => {
    setGameState('game');
  };

  const endGame = () => {
    setGameState('chooseCharacters');
  };

  // Handle footer visibility on game state change
  useEffect(() => {
    if (document.getElementById('footer')) {
      if (gameState === 'chooseCharacters')
        document.getElementById('footer').style.display = "block";
      else
        document.getElementById('footer').style.display = "none";
    }
  }, [gameState]);

  // Initial footer visibility
  useEffect(() => {
    if (document.getElementById('footer'))
      document.getElementById('footer').style.display = "block";
  }, []);

  return (
    <div>
      <Navbar
        gameState={gameState}
        handleEndGame={endGame}
      />
      <div className="outercontainer">
        <div className="container game">
          <GameContainer
            gameState={gameState}
            handleStartGame={startGame}
            handleEndGame={endGame}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
