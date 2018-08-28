import React from "react";
import "./App.css";
import { connect } from "react-redux";
import withAuthorization from "./withAuthorization";

import { Grid } from "semantic-ui-react";

import SidePanel from "./components/SidePanel/SidePanel";
import ColorPanel from "./components/ColorPanel/ColorPanel";
import Messages from "./components/Messages/Messages";
import MetaPanel from "./components/MetaPanel/MetaPanel";

class App extends React.Component {
  render() {
    const { secondaryColor, currentChannel, topUsers } = this.props;

    return (
      <Grid
        columns="equal"
        className="app"
        style={{ background: secondaryColor }}
      >
        <ColorPanel />
        <SidePanel />

        <Grid.Column style={{ marginLeft: 320 }}>
          <Messages currentChannel={currentChannel} key={Date.now()} />
        </Grid.Column>

        {/* <Grid.Column width={4}>
          <MetaPanel
            key={Date.now()}
            topUsers={topUsers}
            currentChannel={currentChannel}
          />
        </Grid.Column> */}
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
  secondaryColor: state.color.secondaryColor,
  currentChannel: state.channel.currentChannel,
  topUsers: state.channel.topUsers
});

export default withAuthorization(connect(mapStateToProps)(App));
