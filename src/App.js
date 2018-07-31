import React from "react";
import "./App.css";

import { Grid } from "semantic-ui-react";
import { ToastContainer, toast } from "react-toastify";

import SidePanel from "./components/SidePanel/SidePanel";
import ColorPanel from "./components/ColorPanel/ColorPanel";
import Messages from "./components/Messages/Messages";
import MetaPanel from "./components/MetaPanel/MetaPanel";

class App extends React.Component {
  componentDidMount() {
    this.notify();
  }
  notify = () =>
    toast("You are now logged in!", {
      position: toast.POSITION.BOTTOM_LEFT
    });

  render() {
    return (
      <Grid columns="equal" className="app" style={{ padding: "1em" }}>
        <ColorPanel />
        <SidePanel />

        <Grid.Column style={{ marginLeft: 320 }}>
          <Messages />
        </Grid.Column>

        <Grid.Column width={4}>
          <MetaPanel />
        </Grid.Column>
        <ToastContainer />
      </Grid>
    );
  }
}

export default App;
