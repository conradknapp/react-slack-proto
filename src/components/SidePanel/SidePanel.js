import React from "react";
import { Menu } from "semantic-ui-react";

import Channels from "./Channels";
import Starred from "./Starred";
import DirectMessages from "./DirectMessages";
import UserPanel from "./UserPanel";

const SidePanel = ({ currentUser, currentChannel, primaryColor }) => (
  <Menu
    size="large"
    inverted
    fixed="left"
    vertical
    style={{ backgroundColor: primaryColor, fontSize: "1.2rem" }}
  >
    <UserPanel primaryColor={primaryColor} currentUser={currentUser} />
    <Starred currentUser={currentUser} />
    <Channels currentChannel={currentChannel} currentUser={currentUser} />
    <DirectMessages currentChannel={currentChannel} currentUser={currentUser} />
  </Menu>
);

export default SidePanel;
