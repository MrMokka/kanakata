import React, { useState, useEffect } from 'react';
import './ShowStage.scss';
import { CSSTransition } from 'react-transition-group';

const ShowStage = ({ stage, handleShowQuestion, handleEndGame, lockStage }) => {
  const [show, setShow] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setShow(true);
    window.scrollTo(0, 0);

    let timeoutID;
    if (stage <= 6) {
      timeoutID = setTimeout(() => {
        setShow(false);
        setTimeout(handleShowQuestion, 1000);
      }, 1200);
    }

    return () => {
      if (timeoutID) clearTimeout(timeoutID);
    };
  }, [stage, handleShowQuestion]);

  const showStage = () => {
    let stageDescription;
    let stageSecondaryDescription = false;

    if (stage === 1) stageDescription = 'Choose one';
    else if (stage === 2) { stageDescription = 'Choose one'; stageSecondaryDescription = 'Reverse'; }
    else if (stage === 3) stageDescription = 'Write the answer';
    else if (stage === 4) { stageDescription = 'Write the answer'; stageSecondaryDescription = 'Three at once'; }
    else if (stage === 5) { stageDescription = 'Draw the character'; stageSecondaryDescription = 'Using your mouse or touchscreen'; }
    else if (stage === 6) { stageDescription = 'Translate the word'; stageSecondaryDescription = 'Japanese ↔ English'; }
    else if (stage === 7)
      return (
        <div className="text-center show-end">
          <h1>Congratulations!</h1>
          <h3>You have passed all 6 stages.</h3>
          <h4>Would you like to keep playing or go back to menu?</h4>
          <p><button className="btn btn-danger keep-playing" onClick={() => lockStage(6)}>Keep playing</button></p>
          <p><button className="btn btn-danger back-to-menu" onClick={handleEndGame}>Back to menu</button></p>
        </div>
      );

    return (
      <div className="text-center show-stage">
        <h1>Stage {stage}</h1>
        <h3>{stageDescription}</h3>
        {stageSecondaryDescription ? <h4>{stageSecondaryDescription}</h4> : ''}
      </div>
    );
  };

  const content = showStage();

  return (
    <CSSTransition classNames="stage" timeout={{ enter: 900, exit: 900 }} in={show} unmountOnExit>
      {() => content}
    </CSSTransition>
  );
};

export default ShowStage;
