import React, { Component } from "react";
import { Icon, Menu } from "semantic-ui-react";

class DirectMessages extends Component {
  state = { activeItem: "inbox" };

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    const { activeItem } = this.state;

    return (
      <React.Fragment>
        <Menu.Menu style={{ paddingBottom: "2em" }}>
          <Menu.Item>
            <span>
              <Icon name="mail" /> DIRECT MESSAGES
            </span>{" "}
            ({this.state.activeItem.length})
          </Menu.Item>
          <Menu.Item
            name="inbox"
            active={activeItem === "inbox"}
            onClick={this.handleItemClick}
            style={{ opacity: 0.7, fontStyle: "italic" }}
          >
            <Icon name="circle" color="grey" />
            @ Jim
          </Menu.Item>
          <Menu.Item
            name="spam"
            active={activeItem === "spam"}
            onClick={this.handleItemClick}
          >
            <Icon name="circle" color="green" />
            @ Don
          </Menu.Item>

          <Menu.Item
            name="updates"
            active={activeItem === "updates"}
            onClick={this.handleItemClick}
          >
            <Icon name="circle" color="green" />
            @ Veronica
          </Menu.Item>
        </Menu.Menu>
      </React.Fragment>
    );
  }
}

export default DirectMessages;
