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
    const { secondaryColor } = this.props;

    return (
      <Grid
        columns="equal"
        className="app"
        style={{ background: secondaryColor }}
      >
        <ColorPanel />
        <SidePanel />

        <Grid.Column style={{ marginLeft: 320 }}>
          <Messages />
        </Grid.Column>

        <Grid.Column width={4}>
          <MetaPanel />
        </Grid.Column>
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
  secondaryColor: state.color.secondaryColor
});

export default withAuthorization(connect(mapStateToProps)(App));
