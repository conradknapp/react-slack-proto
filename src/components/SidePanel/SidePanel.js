import React from "react";
import { Menu } from "semantic-ui-react";

import Channels from "./Channels";
import Starred from "./Starred";
import DirectMessages from "./DirectMessages";
import UserPanel from "./UserPanel";

const SidePanel = () => (
  <Menu
    size="large"
    inverted
    fixed="left"
    vertical
    style={{ backgroundColor: "#4c3c4c", fontSize: "1.2rem" }}
  >
    <UserPanel />
    <Starred />
    <Channels />
    <DirectMessages />
  </Menu>
);

export default SidePanel;
