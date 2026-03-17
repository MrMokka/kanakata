import React, { Component } from 'react';
import Question from './Question';
import DrawQuestion from './DrawQuestion';
import WordTranslateQuestion from './WordTranslateQuestion';
import Summary from './Summary';

class Game extends Component {
  state = {
    showSummary: false,
    results: []
  }

  handleStageComplete = (results) => {
    this.setState({
      showSummary: true,
      results: results || []
    });
  }

  render() {
    if (this.state.showSummary) {
      return (
        <Summary
          results={this.state.results}
          onBackToMenu={this.props.handleEndGame}
        />
      );
    }

    return (
      <div>
        {
          this.props.stage === 6 ?
            <WordTranslateQuestion handleStageComplete={this.handleStageComplete} stage={this.props.stage} decidedGroups={this.props.decidedGroups} />
          : this.props.stage === 5 ?
            <DrawQuestion handleStageComplete={this.handleStageComplete} stage={this.props.stage} decidedGroups={this.props.decidedGroups} />
          :
            <Question handleStageComplete={this.handleStageComplete} stage={this.props.stage} decidedGroups={this.props.decidedGroups} />
        }
      </div>
    );
  }
}

export default Game;
