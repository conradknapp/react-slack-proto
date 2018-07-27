import React, { Component } from "react";
import { Icon, Label, Menu } from "semantic-ui-react";

class Channels extends Component {
  state = { activeItem: "inbox" };

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    const { activeItem } = this.state;

    return (
      <React.Fragment>
        <Menu.Menu style={{ paddingBottom: "2em" }}>
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>{" "}
            ({this.state.activeItem.length}) <Icon name="add" />
          </Menu.Item>
          <Menu.Item
            name="inbox"
            active={activeItem === "inbox"}
            onClick={this.handleItemClick}
            style={{ opacity: 0.7 }}
          >
            <Label color="red">2</Label>
            # Inbox
          </Menu.Item>
          <Menu.Item
            name="spam"
            active={activeItem === "spam"}
            onClick={this.handleItemClick}
          >
            # Spam
          </Menu.Item>

          <Menu.Item
            name="updates"
            active={activeItem === "updates"}
            onClick={this.handleItemClick}
          >
            # Updates
          </Menu.Item>
        </Menu.Menu>
      </React.Fragment>
    );
  }
}

export default Channels;
