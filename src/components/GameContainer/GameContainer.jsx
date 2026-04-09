import React, { useState } from 'react';
import ChooseCharacters from '../ChooseCharacters/ChooseCharacters';
import Game from '../Game/Game';

const GameContainer = ({ gameState, handleStartGame, handleEndGame }) => {
  const [stage, setStage] = useState(1);
  const [decidedGroups, setDecidedGroups] = useState(
    JSON.parse(localStorage.getItem('decidedGroups') || null) || []
  );
  const [questionCount, setQuestionCount] = useState(15);

  const startGame = (groups, stageNum, count) => {
    setDecidedGroups(groups);
    setStage(stageNum);
    setQuestionCount(count);
    localStorage.setItem('decidedGroups', JSON.stringify(groups));
    handleStartGame();
  };

  return (
    <div>
      {gameState === 'chooseCharacters' && (
        <ChooseCharacters
          selectedGroups={decidedGroups}
          handleStartGame={startGame}
        />
      )}
      {gameState === 'game' && (
        <Game
          decidedGroups={decidedGroups}
          handleEndGame={handleEndGame}
          stage={stage}
          questionCount={questionCount}
        />
      )}
    </div>
  );
};

export default GameContainer;
