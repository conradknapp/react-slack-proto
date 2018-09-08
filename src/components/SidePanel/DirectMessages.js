import React from "react";
import firebase from "../../firebase";
import { Menu, Icon } from "semantic-ui-react";
import { connect } from "react-redux";

import { setCurrentChannel, setPrivateChannel } from "../../actions";

class DirectMessages extends React.Component {
  state = {
    //activeItem: "inbox",
    user: this.props.currentUser,
    channel: this.props.currentChannel,
    users: [],
    usersRef: firebase.database().ref("users"),
    connectedRef: firebase.database().ref(".info/connected"),
    presenceRef: firebase.database().ref("presence")
  };

  componentDidMount() {
    if (this.state.user && this.state.user.uid) {
      this.addListeners();
    }
  }

  componentWillUnmount() {
    this.detachListeners();
  }

  addListeners = () => {
    this.state.usersRef.on("child_added", snap => {
      if (this.state.user.uid !== snap.key) {
        let user = snap.val();
        user["uid"] = snap.key;
        user["status"] = "offline";
        this.setState({ users: [...this.state.users, user] });
      }
    });

    this.state.presenceRef.on("child_added", snap => {
      if (this.state.user.uid !== snap.key) {
        this.addStatusToUser(snap.key);
      }
    });

    this.state.presenceRef.on("child_removed", snap => {
      if (this.state.user.uid !== snap.key) {
        this.addStatusToUser(snap.key, false);
      }
    });

    this.state.connectedRef.on("value", snap => {
      if (snap.val() === true) {
        const ref = this.state.presenceRef.child(this.state.user.uid);
        ref.set(true);
        ref.onDisconnect().remove(err => {
          if (err !== null) {
            console.error(err);
          }
        });
      }
    });
  };

  addStatusToUser = (userId, connected = true) => {
    const updatedUsersArray = this.state.users.reduce((acc, user) => {
      if (user.uid === userId) {
        user["status"] = `${connected ? "online" : "offline"}`;
      }
      return acc.concat(user);
    }, []);
    this.setState({ users: updatedUsersArray });
  };

  isUserOnline = user => user.status === "online";

  isChannelActive = user => {
    if (this.state.channel) {
      const channelId = this.getChannelId(user.uid);
      return this.props.currentChannel.id === channelId;
    }
  };

  changeChannel = user => {
    const channelId = this.getChannelId(user.uid);
    const channelData = {
      id: channelId,
      name: user.name
    };
    this.props.setCurrentChannel(channelData);
    this.props.setPrivateChannel(true);
  };

  getChannelId = userId => {
    const currentUserId = this.props.currentUser.uid;
    return userId < currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`;
  };

  detachListeners = () => {
    this.state.usersRef.off();
    this.state.presenceRef.off();
    this.state.connectedRef.off();
  };

  //handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    const { activeItem, users } = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail" /> DIRECT MESSAGES
          </span>{" "}
          ({users.length})
        </Menu.Item>
        {users.map(user => (
          <Menu.Item
            key={user.uid}
            name="inbox"
            active={activeItem === "inbox"}
            onClick={() => this.changeChannel(user)}
            style={{ opacity: 0.7, fontStyle: "italic" }}
          >
            <Icon
              name="circle"
              color={this.isUserOnline(user) ? "green" : "red"}
            />
            @ {user.name}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }
}

export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(DirectMessages);
