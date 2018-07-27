import React from "react";
import { connect } from "react-redux";
import { Header, Segment, Input, Icon } from "semantic-ui-react";

const MessagesHeader = ({ channel, handleSearchChange, uniqueUsers }) => (
  <Segment clearing>
    <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
      <span>
        {channel} <Icon size="small" name="star outline" />
      </span>
      <Header.Subheader>{uniqueUsers}</Header.Subheader>
    </Header>
    <Header floated="right">
      <Input
        size="mini"
        icon="search"
        name="searchTerm"
        placeholder="Search messages"
        onChange={handleSearchChange}
      />
    </Header>
  </Segment>
);

const mapStateToProps = state => ({
  currentChannel: state.channel.currentChannel
});

export default connect(mapStateToProps)(MessagesHeader);
