import React, { Component } from "react";
import { Icon, Menu } from "semantic-ui-react";

class Starred extends Component {
  state = { activeItem: "inbox" };

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    const { activeItem } = this.state;

    return (
      <React.Fragment>
        <Menu.Menu style={{ paddingBottom: "2em" }}>
          <Menu.Item>
            <span>
              <Icon name="star" /> STARRED
            </span>
          </Menu.Item>
          <Menu.Item
            name="inbox"
            active={activeItem === "inbox"}
            onClick={this.handleItemClick}
            style={{ opacity: 0.7, fontStyle: "italic" }}
          >
            @ Doug
          </Menu.Item>
          <Menu.Item
            name="spam"
            active={activeItem === "spam"}
            onClick={this.handleItemClick}
          >
            # events
          </Menu.Item>

          <Menu.Item
            name="updates"
            active={activeItem === "updates"}
            onClick={this.handleItemClick}
          >
            @ Veronica
          </Menu.Item>
        </Menu.Menu>
      </React.Fragment>
    );
  }
}

export default Starred;
