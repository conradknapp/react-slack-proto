import React, { Component } from "react";
import { Header, Segment, Accordion, Icon, Image } from "semantic-ui-react";

class MetaPanel extends Component {
  state = {
    loading: true,
    currentChannel: this.props.currentChannel,
    topUsers: this.props.topUsers,
    activeIndex: 2
  };

  componentDidMount() {
    console.log(this.state.topUsers, this.state.currentChannel);
  }

  handleClick = titleProps => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  };

  render() {
    const { activeIndex, currentChannel, topUsers } = this.state;
    const isPrivateChannel = false;
    if (isPrivateChannel || !currentChannel) return null;

    return (
      <Segment loading={!currentChannel}>
        <Header as="h3" attached="top">
          About # {currentChannel.name}
        </Header>
        <Accordion styled attached="true">
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={this.handleClick}
          >
            <Icon name="dropdown" />
            <Icon name="info" />
            Channel Details
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            {currentChannel.details}
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 1}
            index={1}
            onClick={this.handleClick}
          >
            <Icon name="dropdown" />
            <Icon name="user circle" />
            Members
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 1}>
            {topUsers &&
              Object.entries(topUsers)
                .sort((a, b) => b[1] - a[1])
                .map(([key, val], i) => {
                  return (
                    <li key={i}>
                      {key}: {val} posts
                    </li>
                  );
                })}
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 2}
            index={2}
            onClick={this.handleClick}
          >
            <Icon name="dropdown" />
            <Icon name="pencil alternate" />
            Created By
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            <Image src={currentChannel.createdBy.avatar} />
            {currentChannel.createdBy.name}
          </Accordion.Content>
        </Accordion>
      </Segment>
    );
  }
}

export default MetaPanel;
