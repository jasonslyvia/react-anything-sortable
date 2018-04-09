import React from 'react';
import { sortable, SortableContainer } from '../../src/index.js';

@sortable
class DemoContainerItem extends React.Component {
  render() {
    return (
      <SortableContainer {...this.props}>
        {this.props.children}
      </SortableContainer>
    );
  }
}

export default DemoContainerItem;
