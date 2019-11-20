import React from 'react';
import { render } from 'react-dom';
import moment from 'moment';

import Timeline from './timeline';
import timelineItems from './timelineItems';
import './index.css';

const App = () => (
  <div className="container">
    <Timeline
      items={timelineItems}

      // <Timeline/> clones data, makes local updates, and
      // exposes an interface to retrieve updated data
      getTimelineData={(data) => console.log(data)}
    />
  </div>
);

render(<App />, document.getElementById('root'));
