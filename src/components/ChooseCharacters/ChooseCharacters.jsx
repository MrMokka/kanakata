import React, { Component } from 'react';
import { kanaDictionary } from '../../data/kanaDictionary';
import './ChooseCharacters.scss';
import CharacterGroup from './CharacterGroup';
import CustomWordEditor from './CustomWordEditor';

// Build a lookup: for each kana character + whichKana section, find the custom key
function buildCharToCustomKey() {
  const map = {};
  const custom = kanaDictionary.custom || {};
  Object.keys(custom).forEach(customKey => {
    const chars = custom[customKey].characters;
    Object.keys(chars).forEach(kana => {
      // Determine which section this belongs to
      if (customKey.startsWith('c_h_')) {
        map['hiragana_' + kana] = customKey;
      } else if (customKey.startsWith('c_k_')) {
        map['katakana_' + kana] = customKey;
      }
    });
  });
  return map;
}

const charToCustomKey = buildCharToCustomKey();

// Migrate old group-based selections to individual character keys
function migrateSelections(selectedGroups) {
  const migrated = [];
  const seen = new Set();
  selectedGroups.forEach(groupName => {
    // Already a custom per-char key — keep it
    if (groupName.startsWith('c_h_') || groupName.startsWith('c_k_')) {
      if (!seen.has(groupName)) {
        migrated.push(groupName);
        seen.add(groupName);
      }
      return;
    }
    // Old group key like h_group1 or k_group2_a — expand to individual keys
    let whichKana = null;
    if (groupName.startsWith('h_')) whichKana = 'hiragana';
    else if (groupName.startsWith('k_')) whichKana = 'katakana';
    if (whichKana && kanaDictionary[whichKana][groupName]) {
      const chars = kanaDictionary[whichKana][groupName].characters;
      Object.keys(chars).forEach(kana => {
        const customKey = charToCustomKey[whichKana + '_' + kana];
        if (customKey && !seen.has(customKey)) {
          migrated.push(customKey);
          seen.add(customKey);
        }
      });
    }
  });
  return migrated;
}

// Get all custom keys for characters in a group
function getCustomKeysForGroup(whichKana, groupName) {
  const group = kanaDictionary[whichKana][groupName];
  if (!group) return [];
  const keys = [];
  Object.keys(group.characters).forEach(kana => {
    const customKey = charToCustomKey[whichKana + '_' + kana];
    if (customKey) keys.push(customKey);
  });
  return keys;
}

class ChooseCharacters extends Component {
  state = {
    errMsg : '',
    selectedGroups: migrateSelections(this.props.selectedGroups || []),
    showAlternatives: [],
    showSimilars: [],
    startIsVisible: true,
    questionCount: 15
  }

  stageDescriptions = [
    { stage: 1, title: 'Choose One', description: 'Pick the correct romaji' },
    { stage: 2, title: 'Reverse', description: 'Pick the correct kana' },
    { stage: 3, title: 'Write', description: 'Type the romaji answer' },
    { stage: 4, title: 'Three at Once', description: 'Type three characters' },
    { stage: 5, title: 'Draw', description: 'Draw the character' },
    { stage: 6, title: 'Word Translation', description: 'Translate words' }
  ]

  componentDidMount() {
    this.testIsStartVisible();
    window.addEventListener('resize', this.testIsStartVisible);
    window.addEventListener('scroll', this.testIsStartVisible);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.testIsStartVisible);
    window.removeEventListener('scroll', this.testIsStartVisible);
  }

  componentDidUpdate(prevProps, prevState) {
    this.testIsStartVisible();
  }

  testIsStartVisible = () => {
    if(this.startRef) {
      const rect = this.startRef.getBoundingClientRect();
      if(rect.y > window.innerHeight && this.state.startIsVisible)
        this.setState({ startIsVisible: false });
      else if(rect.y <= window.innerHeight && !this.state.startIsVisible)
        this.setState({ startIsVisible: true });
    }
  }

  scrollToStart() {
    if(this.startRef) {
      const rect = this.startRef.getBoundingClientRect();
      const absTop = rect.top + window.pageYOffset;
      const scrollPos = absTop - window.innerHeight + 50;
      window.scrollTo(0, scrollPos > 0 ? scrollPos : 0);
    }
  }

  // Build a Set of selected kana characters for quick lookup
  getSelectedCharsSet() {
    const set = new Set();
    const custom = kanaDictionary.custom || {};
    this.state.selectedGroups.forEach(key => {
      if (custom[key]) {
        Object.keys(custom[key].characters).forEach(kana => set.add(kana));
      }
    });
    return set;
  }

  getIndex(groupName) {
    return this.state.selectedGroups.indexOf(groupName);
  }

  isSelected(groupName) {
    return this.getIndex(groupName) > -1;
  }

  // Toggle an entire group: add or remove all individual character keys for that group
  toggleSelect = (groupName) => {
    // Find which kana section this group belongs to
    let whichKana = null;
    if (groupName.startsWith('h_')) whichKana = 'hiragana';
    else if (groupName.startsWith('k_')) whichKana = 'katakana';
    else if (groupName.startsWith('c_')) {
      // Direct custom key toggle (for custom section)
      if (this.isSelected(groupName)) {
        const newGroups = this.state.selectedGroups.filter(g => g !== groupName);
        this.setState({ selectedGroups: newGroups });
      } else {
        this.setState({ errMsg: '', selectedGroups: [...this.state.selectedGroups, groupName] });
      }
      return;
    }

    if (!whichKana) return;

    const customKeys = getCustomKeysForGroup(whichKana, groupName);
    const selectedSet = new Set(this.state.selectedGroups);

    // Check if all chars in this group are currently selected
    const allSelected = customKeys.every(k => selectedSet.has(k));

    let newGroups;
    if (allSelected) {
      // Deselect all chars in this group
      const removeSet = new Set(customKeys);
      newGroups = this.state.selectedGroups.filter(g => !removeSet.has(g));
    } else {
      // Select all chars in this group
      newGroups = this.state.selectedGroups.slice();
      customKeys.forEach(k => {
        if (!selectedSet.has(k)) {
          newGroups.push(k);
        }
      });
    }
    this.setState({ errMsg: '', selectedGroups: newGroups });
  }

  // Toggle an individual character
  toggleChar = (kana, whichKana) => {
    const customKey = charToCustomKey[whichKana + '_' + kana];
    if (!customKey) return;

    const selectedSet = new Set(this.state.selectedGroups);
    let newGroups;
    if (selectedSet.has(customKey)) {
      newGroups = this.state.selectedGroups.filter(g => g !== customKey);
    } else {
      newGroups = [...this.state.selectedGroups, customKey];
    }
    this.setState({ errMsg: '', selectedGroups: newGroups });
  }

  selectAll(whichKana, altOnly=false, similarOnly=false) {
    const thisKana = kanaDictionary[whichKana];
    const selectedSet = new Set(this.state.selectedGroups);
    let newSelectedGroups = this.state.selectedGroups.slice();

    Object.keys(thisKana).forEach(groupName => {
      const matchesFilter =
        (altOnly && groupName.endsWith('_a')) ||
        (similarOnly && groupName.endsWith('_s')) ||
        (!altOnly && !similarOnly);

      if (matchesFilter) {
        const customKeys = getCustomKeysForGroup(whichKana, groupName);
        customKeys.forEach(k => {
          if (!selectedSet.has(k)) {
            newSelectedGroups.push(k);
            selectedSet.add(k);
          }
        });
      }
    });
    this.setState({ errMsg: '', selectedGroups: newSelectedGroups });
  }

  selectNone(whichKana, altOnly=false, similarOnly=false) {
    const thisKana = kanaDictionary[whichKana];
    const removeSet = new Set();

    Object.keys(thisKana).forEach(groupName => {
      const matchesFilter =
        (altOnly && groupName.endsWith('_a')) ||
        (similarOnly && groupName.endsWith('_s')) ||
        (!altOnly && !similarOnly);

      if (matchesFilter) {
        getCustomKeysForGroup(whichKana, groupName).forEach(k => removeSet.add(k));
      }
    });

    const newSelectedGroups = this.state.selectedGroups.filter(g => !removeSet.has(g));
    this.setState({ selectedGroups: newSelectedGroups });
  }

  toggleAlternative(whichKana, postfix) {
    let show = postfix === '_a' ? this.state.showAlternatives : this.state.showSimilars;
    const idx = show.indexOf(whichKana);
    if(idx >= 0)
      show.splice(idx, 1);
    else
      show.push(whichKana)
    if(postfix === '_a')
      this.setState({showAlternatives: show});
    if(postfix === '_s')
      this.setState({showSimilars: show});
  }

  getSelectedAlternatives(whichKana, postfix) {
    const thisKana = kanaDictionary[whichKana];
    const selectedSet = new Set(this.state.selectedGroups);
    let total = 0;
    let selected = 0;
    Object.keys(thisKana).forEach(groupName => {
      if (groupName.endsWith(postfix)) {
        const customKeys = getCustomKeysForGroup(whichKana, groupName);
        total += customKeys.length;
        customKeys.forEach(k => { if (selectedSet.has(k)) selected++; });
      }
    });
    return { total, selected };
  }

  alternativeToggleRow(whichKana, postfix, show) {
    const { total, selected } = this.getSelectedAlternatives(whichKana, postfix);
    let checkBtn = "glyphicon glyphicon-small glyphicon-"
    let status;
    if(selected >= total && total > 0)
      status = 'check';
    else if(selected > 0)
      status = 'check half';
    else
      status = 'unchecked'
    checkBtn += status

    return <div
      key={'alt_toggle_' + whichKana + postfix}
      onClick={() => this.toggleAlternative(whichKana, postfix)}
      className="choose-row"
    >
      <span
        className={checkBtn}
        onClick={ e => {
          if(status === 'check')
            this.selectNone(whichKana, postfix === '_a', postfix === '_s');
          else if(status === 'check half' || status === 'unchecked')
            this.selectAll(whichKana, postfix === '_a', postfix === '_s');
          e.stopPropagation();
        }}
      ></span>
      {
        show ? <span className="toggle-caret">&#9650;</span>
          : <span className="toggle-caret">&#9660;</span>
      }
      {
        postfix === '_a' ? 'Alternative characters (ga · ba · kya..)' :
          'Look-alike characters'
      }
    </div>
  }

  // Check group selection state based on individual character keys
  getGroupSelectionState(whichKana, groupName) {
    const customKeys = getCustomKeysForGroup(whichKana, groupName);
    const selectedSet = new Set(this.state.selectedGroups);
    const selectedCount = customKeys.filter(k => selectedSet.has(k)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === customKeys.length) return 'all';
    return 'partial';
  }

  showGroupRows(whichKana, showAlternatives, showSimilars = false, showAll=false) {
    const thisKana = kanaDictionary[whichKana];
    const selectedSet = new Set(this.state.selectedGroups);
    const selectedChars = this.getSelectedCharsSet();
    let rows = [];
    Object.keys(thisKana).forEach((groupName, idx) => {
      if(groupName === "h_group11_a" || groupName === "k_group13_a")
        rows.push(this.alternativeToggleRow(whichKana, "_a", showAlternatives));
      if(groupName === "k_group11_s")
        rows.push(this.alternativeToggleRow(whichKana, "_s", showSimilars));

      if(showAll || ((!groupName.endsWith("a") || showAlternatives) &&
        (!groupName.endsWith("s") || showSimilars))) {

        const selState = this.getGroupSelectionState(whichKana, groupName);
        rows.push(<CharacterGroup
          key={idx}
          groupName={groupName}
          selected={selState === 'all'}
          selectedChars={selectedChars}
          characters={thisKana[groupName].characters}
          handleToggleSelect={this.toggleSelect}
          handleToggleChar={this.toggleChar}
          whichKana={whichKana}
        />);
      }
    });

    return rows;
  }

  startGame(stage) {
    if(stage !== 6 && this.state.selectedGroups.length < 1) {
      this.setState({ errMsg: 'Choose at least one character!'});
      return;
    }
    const count = Math.max(1, parseInt(this.state.questionCount, 10) || 15);
    this.props.handleStartGame(this.state.selectedGroups, stage, count);
  }

  render() {
    return (
      <div className="choose-characters">
        <div className="row">
          <div className="col-xs-12">
            <div className="panel panel-default">
              <div className="panel-body welcome">
                <h4>Welcome to Kana Pro!</h4>
                <p>Please choose the characters you'd like to study. Click a row to select the whole group, or click ▼ to pick individual characters.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 text-center" style={{ marginBottom: '20px' }}>
            {
              this.state.errMsg !== '' &&
                <div className="error-message">{this.state.errMsg}</div>
            }
            <div ref={c => this.startRef = c}>
              <p style={{ marginBottom: '10px', color: '#666' }}>Choose a game mode:</p>
              <div style={{ marginBottom: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ margin: 0, fontWeight: 'normal', color: '#666' }}>Questions:</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={this.state.questionCount}
                  onChange={(e) => this.setState({ questionCount: e.target.value })}
                  style={{ width: '70px', display: 'inline-block', textAlign: 'center' }}
                />
              </div>
              <div className="stage-buttons">
                {this.stageDescriptions.map(({ stage, title, description }) => (
                  <button
                    key={stage}
                    className="btn btn-danger stage-start-button"
                    onClick={() => this.startGame(stage)}
                    title={description}
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-6">
            <div className="panel panel-default">
              <div className="panel-heading">Hiragana · ひらがな</div>
              <div className="panel-body selection-areas">
                {this.showGroupRows('hiragana', this.state.showAlternatives.indexOf('hiragana') >= 0)}
              </div>
              <div className="panel-footer text-center">
                <a href="javascript:" onClick={()=>this.selectAll('hiragana')}>All</a> &nbsp;&middot;&nbsp; <a href="javascript:"
                                                                                                               onClick={()=>this.selectNone('hiragana')}>None</a>
                &nbsp;&middot;&nbsp; <a href="javascript:" onClick={()=>this.selectAll('hiragana', true)}>All alternative</a>
                &nbsp;&middot;&nbsp; <a href="javascript:" onClick={()=>this.selectNone('hiragana', true)}>No alternative</a>
              </div>
            </div>
          </div>
          <div className="col-sm-6">
            <div className="panel panel-default">
              <div className="panel-heading">Katakana · カタカナ</div>
              <div className="panel-body selection-areas">
                {this.showGroupRows('katakana', this.state.showAlternatives.indexOf('katakana') >= 0, this.state.showSimilars.indexOf('katakana') >= 0)}
              </div>
              <div className="panel-footer text-center">
                <a href="javascript:" onClick={()=>this.selectAll('katakana')}>All</a> &nbsp;&middot;&nbsp; <a href="javascript:"
                                                                                                               onClick={()=>this.selectNone('katakana')}>None
                </a>
                &nbsp;&middot;&nbsp; <a href="javascript:" onClick={()=>this.selectAll('katakana', true)}>All alternative</a>
                &nbsp;&middot;&nbsp; <a href="javascript:" onClick={()=>this.selectNone('katakana', true)}>No alternative</a>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <CustomWordEditor />
            </div>
          </div>
          <div className="down-arrow"
            style={{display: this.state.startIsVisible ? 'none' : 'block'}}
            onClick={(e) => this.scrollToStart(e)}
          >
            Start
          </div>
        </div>
      </div>
    );
  }
}

export default ChooseCharacters;
