import React from "react";
import firebase from "../../firebase";
import { Menu, Icon } from "semantic-ui-react";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";

class DirectMessages extends React.Component {
  state = {
    //activeItem: "inbox",
    users: [],
    usersRef: firebase.database().ref("users"),
    connectedRef: firebase.database().ref(".info/connected"),
    presenceRef: firebase.database().ref("presence")
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.detachListeners();
  }

  addListeners = () => {
    this.state.usersRef.on("child_added", snap => {
      if (this.props.currentUser.uid !== snap.key) {
        let user = snap.val();
        user["uid"] = snap.key;
        user["status"] = "offline";
        this.setState({ users: [...this.state.users, user] });
      }
    });

    this.state.presenceRef.on("child_added", snap => {
      if (this.props.currentUser.uid !== snap.key) {
        this.addStatusToUser(snap.key);
      }
    });

    this.state.presenceRef.on("child_removed", snap => {
      if (this.props.currentUser.uid !== snap.key) {
        this.addStatusToUser(snap.key, false);
      }
    });

    this.state.connectedRef.on("value", snap => {
      if (snap.val() === true) {
        const ref = this.state.presenceRef.child(this.props.currentUser.uid);
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
    if (this.props.currentChannel) {
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
      <Menu.Menu style={{ paddingBottom: "2em" }}>
        <Menu.Item>
          <span>
            <Icon name="mail" /> DIRECT MESSAGES
          </span>{" "}
          ({this.state.users.length})
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

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel
});

export default connect(
  mapStateToProps,
  { setCurrentChannel, setPrivateChannel }
)(DirectMessages);
