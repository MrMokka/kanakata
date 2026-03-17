import React, { Component } from 'react';
import { getCustomWords, addCustomWord, removeCustomWord } from '../../data/wordDictionary';
import './ChooseCharacters.scss';

class CustomWordEditor extends Component {
  state = {
    customWords: [],
    japanese: '',
    romaji: '',
    english: '',
    kanji: '',
    error: '',
    isExpanded: false,
    showExport: false
  }

  componentDidMount() {
    this.loadCustomWords();
  }

  loadCustomWords() {
    const customWords = getCustomWords();
    this.setState({ customWords });
  }

  handleInputChange = (field) => (e) => {
    this.setState({ [field]: e.target.value, error: '' });
  }

  handleAddWord = (e) => {
    e.preventDefault();
    const { japanese, romaji, english, kanji } = this.state;

    // Validation
    if (!japanese.trim() || !romaji.trim() || !english.trim()) {
      this.setState({ error: 'Japanese, Romaji, and English are required!' });
      return;
    }

    const newWord = {
      japanese: japanese.trim(),
      romaji: romaji.trim().toLowerCase(),
      english: english.trim().toLowerCase()
    };

    if (kanji.trim()) {
      newWord.kanji = kanji.trim();
    }

    addCustomWord(newWord);
    this.setState({
      japanese: '',
      romaji: '',
      english: '',
      kanji: '',
      error: ''
    });
    this.loadCustomWords();
  }

  handleRemoveWord = (index) => {
    removeCustomWord(index);
    this.loadCustomWords();
  }

  toggleExpanded = () => {
    this.setState(prevState => ({ isExpanded: !prevState.isExpanded }));
  }

  toggleExport = () => {
    this.setState(prevState => ({ showExport: !prevState.showExport }));
  }

  generateExportCode = () => {
    const { customWords } = this.state;
    if (customWords.length === 0) return '// No custom words to export';

    const lines = customWords.map(word => {
      if (word.kanji) {
        return `  { japanese: '${word.japanese}', romaji: '${word.romaji}', english: '${word.english}', kanji: '${word.kanji}' },`;
      } else {
        return `  { japanese: '${word.japanese}', romaji: '${word.romaji}', english: '${word.english}' },`;
      }
    });

    return lines.join('\n');
  }

  copyToClipboard = () => {
    const exportCode = this.generateExportCode();
    navigator.clipboard.writeText(exportCode).then(() => {
      this.setState({ error: '' });
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }

  render() {
    const { customWords, japanese, romaji, english, kanji, error, isExpanded } = this.state;

    return (
      <div className="panel panel-default" style={{ marginTop: '15px' }}>
        <div
          className="panel-heading"
          style={{ cursor: 'pointer' }}
          onClick={this.toggleExpanded}
        >
          <strong>Custom Words</strong>
          <span style={{ float: 'right' }}>
            {customWords.length} word{customWords.length !== 1 ? 's' : ''}
            {' '}
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>

        {isExpanded && (
          <div className="panel-body">
            {/* Add new word form */}
            <form onSubmit={this.handleAddWord} style={{ marginBottom: '15px' }}>
              <div className="row">
                <div className="col-sm-3 col-xs-6" style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Japanese (kana)"
                    value={japanese}
                    onChange={this.handleInputChange('japanese')}
                  />
                </div>
                <div className="col-sm-2 col-xs-6" style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Romaji"
                    value={romaji}
                    onChange={this.handleInputChange('romaji')}
                  />
                </div>
                <div className="col-sm-3 col-xs-6" style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="English"
                    value={english}
                    onChange={this.handleInputChange('english')}
                  />
                </div>
                <div className="col-sm-2 col-xs-6" style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Kanji (optional)"
                    value={kanji}
                    onChange={this.handleInputChange('kanji')}
                  />
                </div>
                <div className="col-sm-2 col-xs-12" style={{ marginBottom: '8px' }}>
                  <button type="submit" className="btn btn-success btn-block">
                    Add Word
                  </button>
                </div>
              </div>
              {error && <div className="text-danger" style={{ marginTop: '5px' }}>{error}</div>}
            </form>

            {/* List of custom words */}
            {customWords.length > 0 ? (
              <div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <table className="table table-condensed table-hover" style={{ marginBottom: 0 }}>
                    <thead>
                      <tr>
                        <th>Japanese</th>
                        <th>Romaji</th>
                        <th>English</th>
                        <th>Kanji</th>
                        <th style={{ width: '60px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {customWords.map((word, idx) => (
                        <tr key={idx}>
                          <td>{word.japanese}</td>
                          <td>{word.romaji}</td>
                          <td>{word.english}</td>
                          <td>{word.kanji || '-'}</td>
                          <td>
                            <button
                              className="btn btn-xs btn-danger"
                              onClick={() => this.handleRemoveWord(idx)}
                              title="Remove word"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Export section */}
                <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <button
                    className="btn btn-sm btn-default"
                    onClick={this.toggleExport}
                  >
                    {this.state.showExport ? 'Hide Export' : 'Export for wordDictionary.js'}
                  </button>

                  {this.state.showExport && (
                    <div style={{ marginTop: '10px' }}>
                      <p className="text-muted" style={{ fontSize: '12px', marginBottom: '5px' }}>
                        Copy and paste this code into wordDictionary.js:
                      </p>
                      <textarea
                        className="form-control"
                        readOnly
                        value={this.generateExportCode()}
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          height: '120px',
                          resize: 'vertical'
                        }}
                        onClick={(e) => e.target.select()}
                      />
                      <button
                        className="btn btn-sm btn-primary"
                        style={{ marginTop: '8px' }}
                        onClick={this.copyToClipboard}
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted text-center" style={{ marginBottom: 0 }}>
                No custom words yet. Add some above to practice them in the Word Translation game!
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default CustomWordEditor;

