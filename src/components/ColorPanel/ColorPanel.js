import React from "react";
import { Menu, Sidebar, Image, Divider } from "semantic-ui-react";

const ColorPanel = () => (
  <Sidebar as={Menu} icon="labeled" inverted vertical visible width="very thin">
    <Divider />
    <Image
      style={{ width: "30px" }}
      src="https://images.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.titanui.com%2Fwp-content%2Fuploads%2F2016%2F07%2F17%2FFresh-Blurry-Gradient-Background-Vector-150x150.png&f=1"
    />
    <Divider />
    <Image
      style={{ width: "30px" }}
      src="https://images.duckduckgo.com/iu/?u=http%3A%2F%2Fonlineteachingtoolkit.com%2Fwp-content%2Fuploads%2F2013%2F07%2Fred-black-gradient-150x150.jpg&f=1"
    />
    <Divider />
    <Image
      style={{ width: "30px" }}
      src="https://images.duckduckgo.com/iu/?u=http%3A%2F%2Fonlineteachingtoolkit.com%2Fwp-content%2Fuploads%2F2013%2F07%2Fblue-black-gradient-150x150.jpg&f=1"
    />
  </Sidebar>
);

export default ColorPanel;
