import React, { Component } from "react";
import { Header, Segment, Accordion, Icon, Image } from "semantic-ui-react";

import { connect } from "react-redux";

class MetaPanel extends Component {
  state = {
    loading: false,
    currentChannel: null,
    activeIndex: 0
  };

  handleClick = (e, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  };

  render() {
    const { activeIndex } = this.state;
    const { currentChannel, isPrivateChannel } = this.props;

    if (isPrivateChannel) return null;

    return (
      <Segment loading={!currentChannel}>
        <Header as="h3" attached="top">
          About # {currentChannel && currentChannel.name}
        </Header>
        {/* <Accordion styled attached="true">
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
            {currentChannel && currentChannel.details}
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
            <p>Doug Jeff Fred</p>
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
            {currentChannel && <Image src={currentChannel.createdBy.avatar} />}
            {currentChannel && currentChannel.createdBy.name}
          </Accordion.Content>
        </Accordion> */}
      </Segment>
    );
  }
}

const mapStateToProps = state => ({
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel
});

export default connect(mapStateToProps)(MetaPanel);
