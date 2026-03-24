import React, { Component } from 'react';
import { getCustomWords, addCustomWord, removeCustomWord, getWordDictionary, baseWordDictionary, addAllBaseWordsAsCustom, removeAllBaseWordsFromCustom } from '../../data/wordDictionary';
import './ChooseCharacters.scss';

class CustomWordEditor extends Component {
  state = {
    customWords: [],
    japanese: '',
    romaji: '',
    english: '',
    kanji: '',
    error: '',
    showExport: false,
    showFullExport: false,
    showBaseWords: false,
    baseWordFilter: '',
    customWordFilter: ''
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

  toggleExport = () => {
    this.setState(prevState => ({ showExport: !prevState.showExport }));
  }

  toggleFullExport = () => {
    this.setState(prevState => ({ showFullExport: !prevState.showFullExport }));
  }

  toggleBaseWords = () => {
    this.setState(prevState => ({ showBaseWords: !prevState.showBaseWords, baseWordFilter: '' }));
  }

  handleBaseWordFilterChange = (e) => {
    this.setState({ baseWordFilter: e.target.value });
  }

  handleCustomWordFilterChange = (e) => {
    this.setState({ customWordFilter: e.target.value });
  }

  getFilteredCustomWords = () => {
    const { customWords, customWordFilter } = this.state;
    if (!customWordFilter.trim()) return customWords;

    const filter = customWordFilter.toLowerCase().trim();
    return customWords.filter(word =>
      word.japanese.includes(filter) ||
      word.romaji.toLowerCase().includes(filter) ||
      word.english.toLowerCase().includes(filter) ||
      (word.kanji && word.kanji.includes(filter))
    );
  }

  copyWordToForm = (word) => {
    this.setState({
      japanese: word.japanese,
      romaji: word.romaji,
      english: word.english,
      kanji: word.kanji || '',
      error: ''
    });
  }

  handleAddAllBaseWords = () => {
    addAllBaseWordsAsCustom();
    this.loadCustomWords();
  }

  handleRemoveAllBaseWords = () => {
    removeAllBaseWordsFromCustom();
    this.loadCustomWords();
  }

  // Check how many base words are currently in custom words
  getBaseWordsInCustomCount = () => {
    const { customWords } = this.state;
    const baseJapaneseSet = new Set(baseWordDictionary.map(w => w.japanese));
    return customWords.filter(w => baseJapaneseSet.has(w.japanese)).length;
  }

  getFilteredBaseWords = () => {
    const { baseWordFilter } = this.state;
    if (!baseWordFilter.trim()) return baseWordDictionary;

    const filter = baseWordFilter.toLowerCase().trim();
    return baseWordDictionary.filter(word =>
      word.japanese.includes(filter) ||
      word.romaji.toLowerCase().includes(filter) ||
      word.english.toLowerCase().includes(filter) ||
      (word.kanji && word.kanji.includes(filter))
    );
  }

  generateFullDictionaryCode = () => {
    const fullDictionary = getWordDictionary();
    if (fullDictionary.length === 0) return '// No words in dictionary';

    const lines = fullDictionary.map(word => {
      if (word.kanji) {
        return `  { japanese: '${word.japanese}', romaji: '${word.romaji}', english: '${word.english}', kanji: '${word.kanji}' },`;
      } else {
        return `  { japanese: '${word.japanese}', romaji: '${word.romaji}', english: '${word.english}' },`;
      }
    });

    return `export const wordDictionary = [\n${lines.join('\n')}\n];`;
  }

  copyFullDictionaryToClipboard = () => {
    const exportCode = this.generateFullDictionaryCode();
    navigator.clipboard.writeText(exportCode).catch(err => {
      console.error('Failed to copy:', err);
    });
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
    navigator.clipboard.writeText(exportCode).catch(err => {
      console.error('Failed to copy:', err);
    });
  }

  render() {
    const { customWords, japanese, romaji, english, kanji, error } = this.state;

    return (
      <div className="panel panel-default" style={{ marginTop: '15px', marginBottom: '200px' }}>
        <div className="panel-heading">
          <strong>Custom Words</strong>
          <span style={{ float: 'right' }}>
            {customWords.length} word{customWords.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="panel-body">
            {/* Browse Base Words Section */}
            <div style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
              <button
                className="btn btn-sm btn-default"
                onClick={this.toggleBaseWords}
              >
                {this.state.showBaseWords ? 'Hide Base Words' : 'Browse Base Words'} ({baseWordDictionary.length} words)
              </button>
              {' '}
              <button
                className="btn btn-sm btn-info"
                onClick={this.handleAddAllBaseWords}
                title="Add all base words as custom words so you can edit them"
              >
                Add All Base Words to Editor
              </button>
              {' '}
              {this.getBaseWordsInCustomCount() > 0 && (
                <button
                  className="btn btn-sm btn-warning"
                  onClick={this.handleRemoveAllBaseWords}
                  title="Remove base words from custom list (keeps your own custom words)"
                >
                  Remove Base Words from Editor ({this.getBaseWordsInCustomCount()})
                </button>
              )}

              {this.state.showBaseWords && (
                <div style={{ marginTop: '10px' }}>
                  <p className="text-muted" style={{ fontSize: '12px', marginBottom: '8px' }}>
                    Click on a word to copy it to the form above for editing. Add it as a custom word to override the original.
                  </p>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search words..."
                    value={this.state.baseWordFilter}
                    onChange={this.handleBaseWordFilterChange}
                    style={{ marginBottom: '10px' }}
                  />
                  <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    <table className="table table-condensed table-hover" style={{ marginBottom: 0 }}>
                      <thead>
                        <tr>
                          <th>Japanese</th>
                          <th>Romaji</th>
                          <th>English</th>
                          <th>Kanji</th>
                          <th style={{ width: '80px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.getFilteredBaseWords().map((word, idx) => (
                          <tr key={idx}>
                            <td>{word.japanese}</td>
                            <td>{word.romaji}</td>
                            <td>{word.english}</td>
                            <td>{word.kanji || '-'}</td>
                            <td>
                              <button
                                className="btn btn-xs btn-primary"
                                onClick={() => this.copyWordToForm(word)}
                                title="Copy to form for editing"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {this.getFilteredBaseWords().length === 0 && (
                      <p className="text-muted text-center" style={{ padding: '10px' }}>
                        No words match your search.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

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
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search custom words..."
                  value={this.state.customWordFilter}
                  onChange={this.handleCustomWordFilterChange}
                  style={{ marginBottom: '10px' }}
                />
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
                      {this.getFilteredCustomWords().map((word) => {
                        const realIndex = customWords.indexOf(word);
                        return (
                          <tr key={realIndex}>
                            <td>{word.japanese}</td>
                            <td>{word.romaji}</td>
                            <td>{word.english}</td>
                            <td>{word.kanji || '-'}</td>
                            <td>
                              <button
                                className="btn btn-xs btn-danger"
                                onClick={() => this.handleRemoveWord(realIndex)}
                                title="Remove word"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {this.getFilteredCustomWords().length === 0 && (
                    <p className="text-muted text-center" style={{ padding: '10px' }}>
                      No words match your search.
                    </p>
                  )}
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

                  {/* Full Dictionary Export */}
                  <button
                    className="btn btn-sm btn-info"
                    style={{ marginLeft: '10px' }}
                    onClick={this.toggleFullExport}
                  >
                    {this.state.showFullExport ? 'Hide Full Dictionary' : 'Export Full Dictionary'}
                  </button>

                  {this.state.showFullExport && (
                    <div style={{ marginTop: '10px' }}>
                      <p className="text-muted" style={{ fontSize: '12px', marginBottom: '5px' }}>
                        Full word dictionary (base words + custom words):
                      </p>
                      <textarea
                        className="form-control"
                        readOnly
                        value={this.generateFullDictionaryCode()}
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          height: '200px',
                          resize: 'vertical'
                        }}
                        onClick={(e) => e.target.select()}
                      />
                      <button
                        className="btn btn-sm btn-primary"
                        style={{ marginTop: '8px' }}
                        onClick={this.copyFullDictionaryToClipboard}
                      >
                        Copy Full Dictionary to Clipboard
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
      </div>
    );
  }
}

export default CustomWordEditor;

