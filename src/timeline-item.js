import React from 'react';
import moment from 'moment';

// Time related constants
const SECONDS_IN_DAY = 86400;

// Layout constants
// Note: it may make sense to refactor and make these configurable by
// exposing them as props
const DAY_WIDTH = 75;
const ITEM_HEIGHT =  50;

const ENTER_KEY_CODE = 13;

const COLORS = [
  '#FFAE08',
  '#E9724C',
  '#C5283D',
  '#255F85',  
];

class TimelineItem extends React.Component {
  constructor(props) {
    super(props);
    
    // Store ref in order to determine if title
    // is truncated by ellipsis so that tooltip can be
    // displayed
    this.nameRef = null;
    
    // Store ref in order to focus input field on click
    this.inputRef = null;

    this.state = {
      isEditing: false,
      name: '',
    }

    this._initializeLayout();
  }

  componentDidUpdate(prevProps) {
    const {item} = this.props;
    if (prevProps.item !== item) {
      this._initializeLayout()
    }
  }

  _initializeLayout = () => {
    const {item, index, startOfRange} = this.props;
    const start = moment(startOfRange);
    const startItem = moment(item.start);
    const endItem = moment(item.end);
    this.leftOffset = (startItem.unix() - start.unix()) / SECONDS_IN_DAY;
    this.width = (endItem.unix() - startItem.unix()) / SECONDS_IN_DAY + 1;
  }

  _onNameRef = (ref) => {
    this.nameRef = ref;
    this.forceUpdate();
  };

  _onInputRef = (ref) => {
    this.inputRef = ref;
    if (ref) {
      this.inputRef.focus();
    }
  };

  _isEllipsisActive = () => this.nameRef
    ? (this.nameRef.offsetWidth < this.nameRef.scrollWidth)
    : false;

  _onEdit = () => {
    this.setState({
      isEditing: true,
      name: '',
    });
  };

  _onInputBlur = () => {
     this.setState({isEditing: false});
  };

  _onChange = (e) => {
    const {value} = e.target;
    this.setState({name: value});
  };

  _onKeyDown = (e) => {
    if (e.keyCode === ENTER_KEY_CODE) {
      const {name} = this.state;
      this.props.onUpdateName(name)
      this._onInputBlur();
    }
  }

  _getContainerStyle = () => {
    const {item, index} = this.props;
    return {
      position: 'absolute',
      border: '1px solid black',
      left: `${this.leftOffset * DAY_WIDTH}px`,
      width: `${this.width  * DAY_WIDTH}px`,
      bottom: `${item.yIndex * ITEM_HEIGHT}px`,
      backgroundColor: COLORS[item.id % COLORS.length],
      height: `${ITEM_HEIGHT}px`,
      padding: '8px',
      lineHeight: `${ITEM_HEIGHT - 16}px`,
      cursor: 'pointer',
    }
  };

  _onDrag = (e) => {
    const {item, onDrag} = this.props;
    e.preventDefault()
    this.props.onDrag(item);
  };

  _onDragEnd = () => {
    this.props.onDrag(null)
  };

  _renderInput() {
    const {item} = this.props;
    const {name} = this.state;
    return  (
      <div className="timeline-item-input-container">
        <input
          className="timeline-item-input"
          type="text"
          placeholder={item.name}
          onBlur={this._onInputBlur}
          ref={this._onInputRef}
          onChange={this._onChange}
          value={name}
          onKeyDown={this._onKeyDown}
        />
      </div>
    );
  }

  _renderContent() {
    const  {item} = this.props;
    return (
      <React.Fragment>
        <div
          style={{position: 'relative'}}
          {...(this._isEllipsisActive() ? {'data-tooltip': item.name} : {})}
        >
          <div
            className="timeline-item-content"
            ref={this._onNameRef}
          >
            {item.name}
          </div>
        </div>
      </React.Fragment>
    );
  }

  render() {
    const {item, index, startOfRange} = this.props;
    const {isEditing} = this.state;
    return (
      <div
        style={this._getContainerStyle()}
        onClick={this._onEdit}
        draggable
        onDrag={this._onDrag}
        onDragEnd={this._onDragEnd}
      >
        {isEditing
          ? this._renderInput()
          : this._renderContent()
        }
      </div>
    );
  }
}

export default TimelineItem;
