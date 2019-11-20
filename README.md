In order to run the project:
```
yarn install
yarn start
```

####  How long you spent on the assignment
 I spent about 5hrs on this assignment
  
#### What you like about your implementation.
Overall I think it's a good start to the component. I like the interface between the parents component, the timeline, and the timeline-item. I think the UI is straightforward: it's easy to understand when each item begins and ends. I think the ability to update an items name and to drag the item to change the start date works well. I like the choice to conditionally use a tooltip to display the full name of the event. One thing that I didn't get around to was updating the CSS to properly vertically scroll if the number of rows does not fit into the timeline window.

#### What you would change if you were going to do it again.
- Potentially remove the reliance on moment.js (it's a large package which isn't ideal for a reuseable component.
- Spend more time thinking about how to achieve a more compact layout which ensures the greatest about of items are filled in on the bottom row

#### How you made your design decisions. For example, if you looked at other timelines for inspiration, please note that.
- Articles for drag interaction: 
  - https://mzabriskie.github.io/react-draggable/example/
  - https://medium.com/the-andela-way/react-drag-and-drop-7411d14894b9
  -  https://www.html5rocks.com/en/tutorials/dnd/basics/
- Timeline inspiration:
  - [https://reactjsexample.com/tag/timeline/](https://reactjsexample.com/tag/timeline/)
  - [https://reactjsexample.com/a-react-timeline-gantt-component/](https://reactjsexample.com/a-react-timeline-gantt-component/)

#### How you would test this if you had more time.
I would use Enzyme/Jest to test the React components. I would also split out some of the business logic (e.g., Timeline._getTimelineData) into a util file and make it more functional. That would make it easy to write unit tests for different corner cases without worrying about mounting the component.