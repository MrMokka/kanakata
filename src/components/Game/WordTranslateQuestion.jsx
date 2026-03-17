import React, { Component } from 'react';
import { wordDictionary } from '../../data/wordDictionary';
import { quizSettings } from '../../data/quizSettings';
import { shuffle } from '../../data/helperFuncs';
import './Question.scss';

/*
Stage 6: Word Translation Game
- Shows a Japanese word (in kana) and asks for the English translation
- Text input field for typing the answer
- Progress bar similar to other stages
*/

class WordTranslateQuestion extends Component {
  state = {
    previousQuestion: null,
    previousAnswer: '',
    previousCorrectAnswer: '',
    wasCorrect: null,
    currentQuestion: null,
    currentAnswer: '',
    stageProgress: 0,
    mode: 'jp-to-en' // 'jp-to-en' or 'en-to-jp'
  }

  componentWillMount() {
    this.availableWords = [...wordDictionary];
    this.previousQuestion = null;
    this.stageProgress = 0;
  }

  componentDidMount() {
    this.setNewQuestion();
  }

  getRandomWords(amount, exclude) {
    let words = this.availableWords.slice();
    if (exclude) {
      words = words.filter(w => w !== exclude);
    }
    shuffle(words);
    return words.slice(0, amount);
  }

  setNewQuestion() {
    // Get a random word, excluding the previous one
    const candidates = this.getRandomWords(1, this.previousQuestion);
    const question = candidates[0];

    this.currentQuestion = question;
    this.setState({
      currentQuestion: question
    });
  }

  handleAnswer = (answer) => {
    const answerTrimmed = answer.trim().toLowerCase();
    const word = this.currentQuestion;

    let isCorrect = false;
    let allowedAnswers = [];

    if (this.state.mode === 'jp-to-en') {
      // Displaying Japanese -> accept English or romaji
      allowedAnswers = [word.english.toLowerCase(), word.romaji.toLowerCase()];
      isCorrect = allowedAnswers.includes(answerTrimmed);
    } else {
      // Displaying English -> accept Japanese or romaji
      allowedAnswers = [word.japanese, word.romaji.toLowerCase()];
      isCorrect = answerTrimmed === word.japanese || answerTrimmed === word.romaji.toLowerCase();
    }

    this.previousQuestion = this.currentQuestion;
    this.previousAllowedAnswers = allowedAnswers;
    this.setState({
      previousQuestion: this.previousQuestion,
      previousAnswer: answer,
      previousCorrectAnswer: this.state.mode === 'jp-to-en'
        ? `${word.english} / ${word.romaji}`
        : `${word.japanese} / ${word.romaji}`,
      wasCorrect: isCorrect
    });

    if (isCorrect) {
      this.stageProgress = this.stageProgress + 1;
    } else {
      this.stageProgress = this.stageProgress > 0 ? this.stageProgress - 1 : 0;
    }
    this.setState({ stageProgress: this.stageProgress });

    if (this.stageProgress >= quizSettings.stageLength[6] && !this.props.isLocked) {
      setTimeout(() => { this.props.handleStageUp() }, 300);
    } else {
      this.setNewQuestion();
    }
  }

  handleAnswerChange = (e) => {
    this.setState({ currentAnswer: e.target.value });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.currentAnswer !== '') {
      this.handleAnswer(this.state.currentAnswer);
      this.setState({ currentAnswer: '' });
    }
  }

  toggleMode = () => {
    this.setState(
      prevState => ({ mode: prevState.mode === 'jp-to-en' ? 'en-to-jp' : 'jp-to-en', currentAnswer: '' }),
      () => this.setNewQuestion()
    );
  }

  getShowableQuestion() {
    if (!this.state.currentQuestion) return '';
    if (this.state.mode === 'jp-to-en') {
      return this.state.currentQuestion.japanese;
    } else {
      return this.state.currentQuestion.english;
    }
  }

  getPreviousResult() {
    if (!this.state.previousQuestion) {
      return <div className="previous-result none">Translate the word!</div>;
    }

    const { previousQuestion, previousCorrectAnswer, wasCorrect } = this.state;
    const questionText = this.state.mode === 'jp-to-en'
      ? `${previousQuestion.japanese} (${previousQuestion.romaji})`
      : previousQuestion.english;
    const rightAnswer = `${questionText} = ${previousCorrectAnswer}`;

    if (wasCorrect) {
      return (
        <div className="previous-result correct" title="Correct answer!">
          <span className="pull-left glyphicon glyphicon-none"></span>
          {rightAnswer}
          <span className="pull-right glyphicon glyphicon-ok"></span>
        </div>
      );
    } else {
      return (
        <div className="previous-result wrong" title="Wrong answer!">
          <span className="pull-left glyphicon glyphicon-none"></span>
          {rightAnswer}
          <span className="pull-right glyphicon glyphicon-remove"></span>
        </div>
      );
    }
  }

  render() {
    const stageProgressPercentage = Math.round((this.state.stageProgress / quizSettings.stageLength[6]) * 100) + '%';
    const stageProgressPercentageStyle = { width: stageProgressPercentage };

    return (
      <div className="text-center question col-xs-12">
        {this.getPreviousResult()}
        <div className="big-character" style={{ fontSize: this.state.mode === 'jp-to-en' ? '72px' : '32px' }}>
          {this.getShowableQuestion()}
        </div>
        <div className="answer-form-container" style={{ maxWidth: this.state.mode === 'en-to-jp' ? '200px' : '150px' }}>
          <form onSubmit={this.handleSubmit}>
            <input
              autoFocus
              className="answer-input"
              type="text"
              value={this.state.currentAnswer}
              onChange={this.handleAnswerChange}
              style={{ width: this.state.mode === 'en-to-jp' ? '180px' : '140px' }}
            />
          </form>
        </div>
        <div style={{ marginTop: '12px' }}>
          <button className="btn btn-xs btn-default" onClick={this.toggleMode}>
            {this.state.mode === 'jp-to-en' ? 'Switch to: English → Japanese' : 'Switch to: Japanese → English'}
          </button>
        </div>
        <div className="progress" style={{ marginTop: '16px' }}>
          <div
            className="progress-bar progress-bar-info"
            role="progressbar"
            aria-valuenow={this.state.stageProgress}
            aria-valuemin="0"
            aria-valuemax={quizSettings.stageLength[6]}
            style={stageProgressPercentageStyle}
          >
            <span>Stage 6 (Words) {this.props.isLocked ? ' (Locked)' : ''}</span>
          </div>
        </div>
      </div>
    );
  }
}

export default WordTranslateQuestion;





