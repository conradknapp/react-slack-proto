import React from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { Segment, Comment } from "semantic-ui-react";

import { setTopUsers } from "../../actions";

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
    channel: this.props.currentChannel,
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

  componentDidMount() {
    const { channel, listeners, messages } = this.state;

    if (channel) {
      this.detachListeners(listeners);
      this.addListeners(channel.id);
    }

    // this.countTopUsers(messages);
    // this.countUniqueUsers(messages);
  }

  componentWillUnmount() {
    this.detachListeners(this.state.listeners);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.messagesEnd) {
      this.scrollToBottom();
    }
  }

  scrollToBottom = () =>
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });

  getUserStars = () => {
    this.state.usersRef
      .child(this.props.currentUser.uid)
      .child("starred")
      .once("value")
      .then(data => {
        if (data.val() !== null) {
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(this.props.currentChannel.id);
          this.setState({ isStarred: prevStarred });
        }
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
    // SetTimeout for Loading Animation
    setTimeout(() => this.setState({ searchLoading: false }), 1000);
  };

  countUniqueUsers = messages => {
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

  countTopUsers = messages => {
    let topUsers = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name] += 1;
      } else {
        acc[message.user.name] = 1;
      }
      return acc;
    }, {});
    console.log(topUsers);
    this.props.setTopUsers(topUsers);
  };

  handleMessageAdded = channelId => {
    let loadedMessages = [];
    const ref = this.getMessagesRef();
    ref.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());
      this.setState(
        {
          messages: loadedMessages,
          loading: false
        },
        () => console.log('fired')
      );
    });
    this.addToListeners(channelId, ref, "child_added");
  };

  addListeners = channelId => {
    this.handleMessageAdded(channelId);
    this.addTypingListener(channelId);
    this.getUserStars();
  };

  addToListeners = (id, ref, event) => {
    const listenerFound = this.state.listeners.findIndex(listener => {
      return (
        listener.id === id && listener.ref === ref && listener.event === event
      );
    });

    if (listenerFound === -1) {
      const newListener = { id, ref, event };
      this.setState({ listeners: this.state.listeners.concat(newListener) });
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

  displayChannelName = channel =>
    channel
      ? `${this.props.isPrivateChannel ? "@" : "#"}${channel.name}`
      : null;

  displayMessages = messages =>
    messages.length > 0 &&
    messages.map(message => (
      <Message key={message.timestamp} message={message} />
    ));

  displayMessageSkeleton = loading =>
    loading ? (
      <React.Fragment>
        {[...Array(15)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </React.Fragment>
    ) : null;

  displayTypingUsers = typingUsers =>
    typingUsers.length > 0 &&
    typingUsers.map((user, i) => (
      <div style={{ display: "flex", alignItems: "center" }} key={i}>
        <span className="user__typing">{user}</span> is typing <Typing />
      </div>
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
          channel={this.displayChannelName(channel)}
          handleSearchChange={this.handleSearchChange}
          handleStar={this.handleStar}
          uniqueUsers={uniqueUsers}
          searchFocused={searchFocused}
          searchLoading={searchLoading}
          isStarred={isStarred}
        />
        <Segment>
          <Comment.Group className="messages" id="messages">
            {/* <Button
              onClick={this.scrollToBottom}
              circular
              icon="arrow up"
              className="up__button"
            /> */}
            {this.displayMessageSkeleton(loading)}
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
            {this.displayTypingUsers(typingUsers)}
            <div ref={c => (this.messagesEnd = c)} />
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

export default connect(
  mapStateToProps,
  { setTopUsers }
)(Messages);
