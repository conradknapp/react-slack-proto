import React from "react";
import { Header, Segment, Input, Icon } from "semantic-ui-react";

const MessagesHeader = ({ channel }) => (
  <Segment clearing>
    <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
      <span>
        {channel} <Icon size="small" name="star outline" />
      </span>
      <Header.Subheader>19 users</Header.Subheader>
    </Header>
    <Header floated="right">
      <span>
        <Input size="mini" icon="search" placeholder="Search..." />
      </span>
    </Header>
  </Segment>
);

export default MessagesHeader;
