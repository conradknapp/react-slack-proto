import React from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
// prettier-ignore
import { Segment, Comment } from "semantic-ui-react";

import Message from "./Message";
import MessageForm from "./MessageForm";
import MessagesHeader from "./MessagesHeader";
import Skeleton from "./Skeleton";
import Typing from "./Typing";

class Messages extends React.Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    privateMessagesRef: firebase.database().ref("privateMessages"),
    usersRef: firebase.database().ref("users"),
    typingRef: firebase.database().ref("isTyping"),
    connectedRef: firebase.database().ref(".info/connected"),
    messages: [],
    listeners: [],
    channel: null,
    loading: true,
    searchTerm: "",
    searchResults: [],
    searchFocused: false,
    searchLoading: false,
    uniqueUsers: "",
    isStarred: false,
    typingUsers: []
  };

  handleSearchChange = event => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true
      },
      () => this.handleSearch()
    );
  };

  static getDerivedStateFromProps(props, state) {
    // prettier-ignore
    if (state.channel === null || props.currentChannel.id !== state.channel.id) {
      return {
        messages: [],
        channel: props.currentChannel,
        uniqueUsers: '0 users',
        isStarred: null
      };
    }
     else {
      return null;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { channel, listeners } = this.state;
    // prettier-ignore
    if ((channel.id && !prevState.channel) || (channel.id !== prevState.channel.id)) {
      this.detachListeners(listeners);
      this.addListeners(channel.id);
      this.addTypingListener(channel.id);
    }
  }

  componentWillUnmount() {
    this.detachListeners(this.state.listeners);
  }

  getUserStars = () => {
    this.state.usersRef
      .child(this.props.currentUser.uid)
      .child("starred")
      .once("value")
      .then(data => {
        const channelIds = Object.keys(data.val());
        const prevStarred = channelIds.includes(this.props.currentChannel.id);
        this.setState({ isStarred: prevStarred });
      })
      .catch(err => console.error(err));
  };

  handleStar = () => {
    this.setState(
      prevState => ({
        isStarred: !prevState.isStarred
      }),
      () => this.starChannel()
    );
  };

  starChannel = () => {
    if (this.state.isStarred) {
      console.log("star");
      this.state.usersRef
        .child(`${this.props.currentUser.uid}/starred`)
        .update({
          [this.props.currentChannel.id]: {
            name: this.props.currentChannel.name,
            details: this.props.currentChannel.details,
            createdBy: {
              name: this.props.currentChannel.createdBy.name,
              avatar: this.props.currentChannel.createdBy.avatar
            }
          }
        });
    } else {
      console.log("unstar");
      this.state.usersRef
        .child(`${this.props.currentUser.uid}/starred`)
        .child(this.props.currentChannel.id)
        .remove();
    }
  };

  handleSearch = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading: false }), 1000);
  };

  countUniqueUsers = (messages = []) => {
    const users = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    const uniqueUsers = `${users.length} user${users.length > 1 ? "s" : ""}`;
    this.setState({ uniqueUsers });
  };

  addTypingListener = channelId => {
    this.state.typingRef.on("value", snap => {
      if (snap.val()) {
        const yourChannel = Object.keys(snap.val())
          .filter(el => el === channelId)
          .map(el => snap.val()[el])[0];

        if (yourChannel) {
          const filtered = Object.keys(yourChannel)
            .filter(k => !k.includes(this.props.currentUser.uid))
            .map(el => yourChannel[el]);
          this.setState({ typingUsers: filtered });
        } else {
          this.setState({ typingUsers: [] });
        }
      }
    });

    this.state.typingRef.on("child_removed", snap => {
      if (snap.val()) {
        const yourChannel = Object.keys(snap.val())
          .filter(el => el === channelId)
          .map(el => snap.val()[el])[0];

        if (yourChannel) {
          const filtered = Object.keys(yourChannel)
            .filter(k => !k.includes(this.props.currentUser.uid))
            .map(el => yourChannel[el]);
          this.setState({ typingUsers: filtered });
        } else {
          this.setState({ typingUsers: [] });
        }
      }
    });

    this.state.connectedRef.on("value", snap => {
      if (snap.val() === true) {
        this.state.typingRef
          .child(this.props.currentChannel.id)
          .child(this.props.currentUser.uid)
          .onDisconnect()
          .remove(err => {
            if (err !== null) {
              console.error(err);
            }
          });
      }
    });
  };

  addListeners = channelId => {
    let messages = [];
    const ref = this.getMessagesRef();
    ref.child(channelId).on("child_added", snap => {
      messages.unshift(snap.val());
      this.countUniqueUsers(messages);
      this.setState({
        messages,
        loading: false
      });
    });
    this.getUserStars();
    this.addToListeners(channelId, ref, "child_added");
  };

  addToListeners = (id, ref, event) => {
    const listenerFound =
      this.state.listeners.findIndex(listener => {
        return (
          listener.id === id && listener.ref === ref && listener.event === event
        );
      }) > -1;

    if (!listenerFound) {
      const newListener = { id, ref, event };
      this.setState({ listeners: [...this.state.listeners, newListener] });
    }
  };

  detachListeners = listeners => {
    listeners.forEach(listener => {
      listener.ref.child(listener.id).off(listener.event);
    });
  };

  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef } = this.state;
    return this.props.isPrivateChannel ? privateMessagesRef : messagesRef;
  };

  getChannelName = channel =>
    channel
      ? `${this.props.isPrivateChannel ? "@" : "#"}${channel.name}`
      : null;

  displayMessages = messages =>
    messages.length > 0 &&
    messages.map(message => (
      <Message key={message.timestamp} message={message} />
    ));

  displaySkeleton = loading =>
    loading ? (
      <React.Fragment>
        {[...Array(15)].map((_, i) => <Skeleton key={i} />)}
      </React.Fragment>
    ) : null;

  displayTypingUsers = typingUsers =>
    typingUsers.length > 0 &&
    typingUsers.map((user, i) => (
      <React.Fragment key={i}>
        {user} is typing...
        <Typing />
      </React.Fragment>
    ));

  render() {
    const {
      channel,
      messages,
      loading,
      searchTerm,
      searchResults,
      searchFocused,
      searchLoading,
      uniqueUsers,
      isStarred,
      typingUsers
    } = this.state;

    return (
      <React.Fragment>
        <MessagesHeader
          channel={this.getChannelName(channel)}
          handleSearchChange={this.handleSearchChange}
          handleStar={this.handleStar}
          uniqueUsers={uniqueUsers}
          searchFocused={searchFocused}
          searchLoading={searchLoading}
          isStarred={isStarred}
        />
        <Segment>
          <Comment.Group className="messages">
            {this.displayTypingUsers(typingUsers)}
            {this.displaySkeleton(loading)}
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
          </Comment.Group>
        </Segment>
        <MessageForm getMessagesRef={this.getMessagesRef} />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel
});

export default connect(mapStateToProps)(Messages);
