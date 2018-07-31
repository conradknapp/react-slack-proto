import React from "react";
import { Menu } from "semantic-ui-react";
import { connect } from 'react-redux'

import Channels from "./Channels";
import Starred from "./Starred";
import DirectMessages from "./DirectMessages";
import UserPanel from "./UserPanel";

const SidePanel = props => (
  <Menu
    size="large"
    inverted
    fixed="left"
    vertical
    style={{ backgroundColor: props.primaryColor, fontSize: "1.2rem" }}
  >
    <UserPanel />
    <Starred />
    <Channels />
    <DirectMessages />
  </Menu>
);

const mapStateToProps = state => ({
  primaryColor: state.color.primaryColor
});

export default connect(mapStateToProps)(SidePanel);
