import React, { Component } from 'react';
import ChooseCharacters from '../ChooseCharacters/ChooseCharacters';
import Game from '../Game/Game';

class GameContainer extends Component {
  state = {
    stage: 1,
    decidedGroups: JSON.parse(localStorage.getItem('decidedGroups') || null) || []
  }

  startGame = (decidedGroups, stage) => {
    this.setState({
      decidedGroups: decidedGroups,
      stage: stage
    });
    localStorage.setItem('decidedGroups', JSON.stringify(decidedGroups));
    this.props.handleStartGame();
  }

  render() {
    return (
      <div>
        { this.props.gameState==='chooseCharacters' &&
            <ChooseCharacters
              selectedGroups={this.state.decidedGroups}
              handleStartGame={this.startGame}
            />
          }
          { this.props.gameState==='game' &&
              <Game
                decidedGroups={this.state.decidedGroups}
                handleEndGame={this.props.handleEndGame}
                stage={this.state.stage}
              />
          }
        </div>
    )
  }
}

export default GameContainer;
