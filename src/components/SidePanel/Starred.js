import React, { Component } from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { Icon, Menu } from "semantic-ui-react";
import { setCurrentChannel, setPrivateChannel } from "../../actions";

class Starred extends Component {
  state = {
    active: "",
    usersRef: firebase.database().ref("users"),
    starredChannels: []
  };

  componentDidMount() {
    this.addListener();
    this.addRemoveListener();
  }

  componentWillUnmount() {
    this.removeListener();
  }

  addListener = () => {
    this.state.usersRef
      .child(this.props.currentUser.uid)
      .child("starred")
      .on("child_added", snap => {
        const starredChannel = { id: snap.key, ...snap.val() };
        this.setState({
          starredChannels: [...this.state.starredChannels, starredChannel]
        });
      });
  };

  addRemoveListener = () => {
    this.state.usersRef
      .child(this.props.currentUser.uid)
      .child("starred")
      .on("child_removed", snap => {
        const starredChannel = { id: snap.key, ...snap.val() };
        const filteredChannels = this.state.starredChannels.filter(
          el => el.id !== starredChannel.id
        );
        this.setState({
          starredChannels: filteredChannels
        });
      });
  };

  removeListener = () => this.state.usersRef.off();

  handleItemClick = channel => {
    this.setState({ active: channel.id });
  };

  changeChannel = channel => {
    this.handleItemClick(channel);
    this.props.setPrivateChannel(false);
    this.props.setCurrentChannel(channel);
  };

  displayChannels = starredChannels =>
    starredChannels.length > 0 &&
    starredChannels.map(channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.7 }}
        active={channel.id === this.state.active}
        //className={this.setActiveChannel(channel) ? "active" : ""}
      >
        # {channel.name}
      </Menu.Item>
    ));

  //handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    const { starredChannels } = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star" /> STARRED ({starredChannels.length})
          </span>
        </Menu.Item>
        {this.displayChannels(starredChannels)}
      </Menu.Menu>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: state.user.currentUser
});

export default connect(
  mapStateToProps,
  { setPrivateChannel, setCurrentChannel }
)(Starred);
