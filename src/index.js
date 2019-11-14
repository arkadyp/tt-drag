import React from 'react';
import { render } from 'react-dom';
import moment from 'moment';

import timelineItems from './timelineItems';
import './index.css';

// Time related constants
const MOMENT_YEAR_FORMAT = 'YYYY-MM-DD';
const DATE_FORMAT = 'DD';
const MONTH_FORMAT = 'MMM';
const SECONDS_IN_DAY = 86400;

// Layout constants
const DAY_WIDTH = 75;
const ITEM_HEIGHT =  50;
const X_AXIS_HEIGHT = 20;

/*
TODO: what happens if an event is 0 days...
 */


function Packer(w, h) {
  this.init(w, h);
};

Packer.prototype = {
  init: function(w, h) {
    this.root = { x: 0, y: 0, w: w, h: h };
  },

  fit: function(blocks) {
    var n, node, block;
    for (n = 0; n < blocks.length; n++) {
      block = blocks[n];
      if (node = this.findNode(this.root, block.w, block.h))
        block.fit = this.splitNode(node, block.w, block.h);
    }
  },

  findNode: function(root, w, h) {
    if (root.used)
      return this.findNode(root.right, w, h) || this.findNode(root.down, w, h);
    else if ((w <= root.w) && (h <= root.h))
      return root;
    else
      return null;
  },

  splitNode: function(node, w, h) {
    node.used = true;
    node.down  = { x: node.x,     y: node.y + h, w: node.w,     h: node.h - h };
    node.right = { x: node.x + w, y: node.y,     w: node.w - w, h: h          };
    return node;
  }
}

const COLORS = [
  'red',
  'green',
  'blue',
  'purple',  
];

class Timeline extends React.Component {
  constructor(props) {
    super(props);

    this.items = props.items
      .map(item => ({...item, yIndex: 0}))
      .sort((d1, d2) => Number(new Date(d1.start)) - Number(new Date(d2.start)))


     this.items.forEach((item, i) => {
       let nextIndex = i + 1;
       let nextItem = this.items[nextIndex]
       while (nextItem && moment(item.end).unix() > moment(nextItem.start).unix()) {
         nextItem.yIndex = item.yIndex + 1;
         nextItem = this.items[nextItem++]
       }
     });
    this.startOfRange = this.items[0].start;
    this.endOfRange = this.items.reduce((end, item) => {
      if (Number(new Date(item.end)) > Number(new Date(end))) {
        end = item.end;
      }
      return end;
    }, this.items[0].end);

    this.baselineData = this.getBaselineData(this.startOfRange, this.endOfRange);

    // const width = (moment(this.endOfRange).unix() - moment(this.startOfRange).unix()) / SECONDS_IN_DAY
    // const blocks = this.items.map((item) => ({
    //   h: 1,
    //   w: (moment(item.end).unix() - moment(item.start).unix()) / SECONDS_IN_DAY,
    //   id: item.id,
    // }))
    // const packer = new Packer(width, 3);
    // packer.fit(blocks)
    // this.blocks = blocks;
    // console.log(this.blocks);
  }

  getBaselineItem = (m) => ({
    month: m.month(),
    date:  m.date(),
    year: m.year(),
    dateDisplay: m.format(DATE_FORMAT),
    monthDisplay: m.format(MONTH_FORMAT),
  });

  getBaselineData = (start, end) => {
    if (!start || !end) {
      throw new Error('derp')
    }

    const m = moment(start);
    
    const items = [];
    while (m.format(MOMENT_YEAR_FORMAT) !== end) {
      items.push(this.getBaselineItem(m))
      m.add(1, 'days');
    }
    items.push(this.getBaselineItem(m))

    return items;
  };

  renderItem = (item, i) => {
    const start = moment(this.startOfRange);
    const end = moment(this.endOfRange);
    const startItem = moment(item.start);
    const endItem = moment(item.end);

    const leftOffset = (startItem.unix() - start.unix()) / SECONDS_IN_DAY;
    const width = (endItem.unix() - startItem.unix()) / SECONDS_IN_DAY + 1;

    console.log(`length of event in days ${item.start} to ${item.end}: `, width);

    return (
      <div
        className="timeline-item"
        style={{
          left: `${leftOffset * DAY_WIDTH}px`,
          width: `${width  * DAY_WIDTH}px`,
          bottom: `${X_AXIS_HEIGHT + item.yIndex * ITEM_HEIGHT}px`,
          backgroundColor: COLORS[i % COLORS.length],
        }}
      >
        {item.start}
      </div>
    );
  };

  render() {
    return (
      <div className="timeline-conatiner">
        <div>
          {this.items.map((item, i) => this.renderItem(item, i))}
        </div>
        <div className="x-axis-container">
          {this.baselineData.map((item) => (
            <div className="baseline-unit">{`${item.monthDisplay} ${item.dateDisplay}`}</div>
          ))}
        </div>
      </div>
    );
  }
}



const App = () => (
  <div className="container">
    <Timeline
      items={timelineItems}
    />
  </div>
);

render(<App />, document.getElementById('root'));


/*

1.) Create an x-axis (first-date, end-date)


 */
