import React from "react";
import "./App.css";
import { connect } from "react-redux";
import { Grid } from "semantic-ui-react";

import SidePanel from "./components/SidePanel/SidePanel";
import ColorPanel from "./components/ColorPanel/ColorPanel";
import Messages from "./components/Messages/Messages";
import MetaPanel from "./components/MetaPanel/MetaPanel";

const App = ({
  primaryColor,
  secondaryColor,
  currentChannel,
  isPrivateChannel,
  topUsers,
  currentUser
}) => (
  <Grid columns="equal" className="app" style={{ background: secondaryColor }}>
    <ColorPanel currentUser={currentUser} />
    <SidePanel
      primaryColor={primaryColor}
      currentUser={currentUser}
      currentChannel={currentChannel}
      key={currentUser && currentUser.uid}
    />

    <Grid.Column style={{ marginLeft: 320 }}>
      <Messages
        currentChannel={currentChannel}
        currentUser={currentUser}
        isPrivateChannel={isPrivateChannel}
        key={currentChannel && currentChannel.id}
      />
    </Grid.Column>

    <Grid.Column width={4}>
      <MetaPanel
        isPrivateChannel={isPrivateChannel}
        key={currentChannel && currentChannel.id}
        topUsers={topUsers}
        currentChannel={currentChannel}
      />
    </Grid.Column>
  </Grid>
);

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
  topUsers: state.channel.topUsers,
  primaryColor: state.color.primaryColor,
  secondaryColor: state.color.secondaryColor
});

export default connect(mapStateToProps)(App);
