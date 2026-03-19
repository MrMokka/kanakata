import React, { Component } from 'react';

class CharacterGroup extends Component {
  state = {
    expanded: false
  }

  getShowableCharacters(whichKana) {
    let strRomajiCharacters = '';
    let strKanaCharacters = '';
    Object.keys(this.props.characters).map(character => {
      strRomajiCharacters+=this.props.characters[character][0]+' · ';
      strKanaCharacters+=character+' · ';
    });
    strRomajiCharacters = strRomajiCharacters.slice(0, -2);
    strKanaCharacters = strKanaCharacters.slice(0, -2);
    if(whichKana === 'romaji') return strRomajiCharacters;
    else return strKanaCharacters;
  }

  getGroupSelectionState() {
    const { characters, selectedChars } = this.props;
    if (!selectedChars) return this.props.selected ? 'all' : 'none';
    const charKeys = Object.keys(characters);
    const selectedCount = charKeys.filter(k => selectedChars.has(k)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === charKeys.length) return 'all';
    return 'partial';
  }

  toggleExpanded = (e) => {
    e.stopPropagation();
    this.setState(prev => ({ expanded: !prev.expanded }));
  }

  render() {
    const kanaStr = this.getShowableCharacters('kana');
    const romajiStr = this.getShowableCharacters('romaji');
    const selectionState = this.getGroupSelectionState();
    const { characters, selectedChars, handleToggleChar, whichKana } = this.props;
    const charKeys = Object.keys(characters);
    const canExpand = selectedChars && charKeys.length > 1;

    let checkClass = 'glyphicon glyphicon-small glyphicon-';
    if (selectionState === 'all') checkClass += 'check';
    else if (selectionState === 'partial') checkClass += 'check half';
    else checkClass += 'unchecked';

    return (
      <div
        className={
          'choose-row'
            + (this.props.groupName.endsWith('_a') || this.props.groupName.endsWith('_s') ? ' alt-row' : '')
            + (['h_group16_a','k_group18_a','k_group29_a'].includes(this.props.groupName) ? ' divider-row' : '')
            + (this.state.expanded ? ' expanded-group' : '')
        }
      >
        <div
          className="group-header"
          onClick={canExpand ? this.toggleExpanded : () => this.props.handleToggleSelect(this.props.groupName)}
        >
          <span
            className={checkClass}
            onClick={(e) => {
              e.stopPropagation();
              this.props.handleToggleSelect(this.props.groupName);
            }}
          ></span>
          <span className="kana"> {kanaStr}</span>
          <span className="separator"> — </span>
          <span className="romaji">{romajiStr}</span>
          {canExpand && (
            <span className="expand-toggle">
              {this.state.expanded ? '▲' : '▼'}
            </span>
          )}
        </div>
        {this.state.expanded && selectedChars && handleToggleChar && (
          <div className="char-grid">
            {charKeys.map(kana => {
              const romaji = characters[kana][0];
              const isSelected = selectedChars.has(kana);
              return (
                <span
                  key={kana}
                  className={'char-item' + (isSelected ? ' char-selected' : '')}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleChar(kana, whichKana);
                  }}
                  title={romaji}
                >
                  <span className={isSelected ?
                    'glyphicon glyphicon-tiny glyphicon-check' :
                    'glyphicon glyphicon-tiny glyphicon-unchecked'}></span>
                  <span className="char-kana">{kana}</span>
                  <span className="char-romaji">{romaji}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

export default CharacterGroup;
