import React, { Component } from "react";
import { Header, Segment, Accordion, Icon, Image } from "semantic-ui-react";

class MetaPanel extends Component {
  state = {
    loading: true,
    channel: this.props.currentChannel,
    privateChannel: this.props.isPrivateChannel,
    activeIndex: 0
  };

  handleClick = (event, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  };

  render() {
    const { activeIndex, channel, privateChannel } = this.state;
    const { topUsers } = this.props;

    if (privateChannel || !channel) return null;

    return (
      <Segment>
        <Header as="h3" attached="top">
          About # {channel.name}
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
            {channel.details}
          </Accordion.Content>

          <Accordion.Title
            active={activeIndex === 1}
            index={1}
            onClick={this.handleClick}
          >
            <Icon name="dropdown" />
            <Icon name="user circle" />
            Top Posters
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
            <Image src={channel.createdBy.avatar} />
            {channel.createdBy.name}
          </Accordion.Content>
        </Accordion>
      </Segment>
    );
  }
}

export default MetaPanel;
