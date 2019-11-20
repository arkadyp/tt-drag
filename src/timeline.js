import React from 'react';
import moment from 'moment';

import TimelineItem from './timeline-item';

// Time related constants
const MOMENT_YEAR_FORMAT = 'YYYY-MM-DD';
const DATE_FORMAT = 'DD';
const MONTH_FORMAT = 'MMM';

/*
  Lays out items in rows to represent a data structure where
  they will not overlap 

  list: [
    [[1, 2], [4, 10], [12, 14]],
    [[2, 7]],
    [[2, 5], [6, 8],  [9, 12]],
  ]

  target: {startTimestamp, endTimestamp, yIndex}

  yIndex: number representing the row index

  Note: This algorthm can be optimized and also it would make
  sense to refactor this to be more functional instead of modifying
  the list and target
 */
const setItemAtYIndex = (list, target, yIndex) => {
  if (!list[yIndex]) {
    list[yIndex] = [target];
    target.yIndex = yIndex;
    return true;
  }

  const row = list[yIndex];
  for (let i = 0; i < row.length; i++) {
    const item = row[i];
    const nextItem = row[i + 1];    
    if (
      target.startTimestamp > item.endTimestamp &&
      (!nextItem || nextItem && target.endTimestamp < nextItem.startTimestamp)
    ) {
      row.push(target);
      target.yIndex = yIndex;
      return true;
    }
  }

  return false;
};

class Timeline extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // Stores list of items to display on timeline with
      // calulated yIndex, start and end of the timeline range,
      // and data representing the days in the timeline
      ...this._getTimelineData(props.items),
      
      // Map of which day a timeline time is being
      // dragged over
      activeDragZone: {},
    };
  }

  _getTimelineData = (inputItems) => {
    const items = inputItems
      .map(item => ({
        ...item,
        yIndex: 0,
        startTimestamp: moment(item.start).unix(),
        endTimestamp: moment(item.end).unix(),
      }))
      .sort((d1, d2) => Number(new Date(d1.start)) - Number(new Date(d2.start)))

    // Set yIndex
    const yIndexList = [];
    items.forEach((item, i) => {
      let yIndex = 0;
      while (!setItemAtYIndex(yIndexList, item, yIndex)) {
        yIndex++;
      }
    });

    const startOfRange = items[0].start;
    const endOfRange = items.reduce((end, item) => {
      if (Number(new Date(item.end)) > Number(new Date(end))) {
        end = item.end;
      }
      return end;
    }, items[0].end);

    return {
      items,
      startOfRange,
      endOfRange,
      baselineData: this.getBaselineData(startOfRange, endOfRange),
    }
  };

  getBaselineItem = (m) => ({
    month: m.month(),
    date:  m.date(),
    year: m.year(),
    dateDisplay: m.format(DATE_FORMAT),
    monthDisplay: m.format(MONTH_FORMAT),
  });

  
  // Note: If there is a lot of sparse data in the timeline, this
  // approach of storing data for each day between the start and end
  // event is not very efficient
  getBaselineData = (start, end) => {
    const m = moment(start);
    const items = [];
    while (m.format(MOMENT_YEAR_FORMAT) !== end) {
      items.push(this.getBaselineItem(m))
      m.add(1, 'days');
    }
    items.push(this.getBaselineItem(m))
    return items;
  };

  _onUpdateName = (name, id) => {
    const {items} = this.state;
    const newItems = items.map(item => ({...item}));
    const updatedItem = newItems.find(item =>  item.id === id);
    updatedItem.name = name;
    this.setState({
      ...this._getTimelineData(newItems),
    })
  };

  _onDrop = (baselineItem) => {
    const {draggedItem, items} = this.state;
    const {month, date, year} = baselineItem;

    const newItems = items.map(item => ({...item}));
    const targetItem = newItems.find(item => item.id === draggedItem.id);

    const oldStartDate = moment(targetItem.start);
    const oldEndDate = moment(targetItem.end);
    const newStartDate = moment([year, month, date]);
    
    let newEndDate;
    if (newStartDate.unix() > oldStartDate.unix()) {
      // move end date forward by difference in days between old and new start date
      newEndDate = oldEndDate.add(
        newStartDate.diff(oldStartDate, 'days'),
        'days'
      );
    } else {
      // move end date back by difference in days between new and old start date
      newEndDate = oldEndDate.subtract(
        oldStartDate.diff(newStartDate, 'days'),
        'days'
      );
    }

    targetItem.start = newStartDate.format(MOMENT_YEAR_FORMAT);
    targetItem.end = newEndDate.format(MOMENT_YEAR_FORMAT);

    this.setState({
      ...this._getTimelineData(newItems),
    })
  };

  _onUpdateActiveDragState = (label, value) => this.setState({
    activeDragZone: {
      ...this.state.activeDragZone,
      [label]: value,
    }
  });

  _onDrag = (timelineItem) => {
    if (timelineItem !== this.state.draggedItem) {
      this.setState({
        draggedItem: timelineItem,
        activeDragZone: {},
      })
    }
  };

  // Method to expose updated timeline data to parent component
  _onGetTimelineData = () => {
    const {getTimelineData} = this.props;
    const {items} = this.state;
    getTimelineData(items.map(({id, start, end, name}) => ({
      id, start, end, name
    })));
  }

  _renderXAxis() {
    const {baselineData} = this.state;
    return baselineData.map((item, i) => {
      const label = `${item.monthDisplay} ${item.dateDisplay}`;
      return (
        <div
          className="baseline-unit"
          key={i}
          style={{
            ...(this.state.activeDragZone[label] ? {
              border: '2px dashed grey',
              background: 'hsla(0, 0%, 50%, 0.2)',
            } : {})
          }}
          onDragEnter={() => this._onUpdateActiveDragState(label, true)}
          onDragLeave={() => this._onUpdateActiveDragState(label, false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {this._onDrop(item)}}
        >
          {label}
        </div>
      )
    })
  }

  render() {
    const {items, startOfRange, endOfRange} = this.state;
    return (
      <React.Fragment>
        <div className="timeline-container">
          <div>
            {items.map((item, i) => (
              <TimelineItem
                key={item.id}
                item={item}
                index={i}
                startOfRange={startOfRange}
                endOfRange={endOfRange}
                onUpdateName={(name) => this._onUpdateName(name, item.id)}
                onDrag={this._onDrag}
              />
            ))}
          </div>
          <div
            className="x-axis-container"
            style={{pointerEvents: this.state.draggedItem ? 'auto' : 'none'}}
          >
            {this._renderXAxis()}
          </div>
        </div>
        <button className="timeline-button" onClick={this._onGetTimelineData}>
          Get timeline data
        </button>
      </React.Fragment>
    );
  }
}

export default Timeline;
