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
    user: this.props.currentUser,
    channel: this.props.currentChannel,
    privateChannel: this.props.isPrivateChannel,
    messagesRef: firebase.database().ref("messages"),
    privateMessagesRef: firebase.database().ref("privateMessages"),
    usersRef: firebase.database().ref("users"),
    typingRef: firebase.database().ref("isTyping"),
    connectedRef: firebase.database().ref(".info/connected"),
    messages: [],
    listeners: [],
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
    const { channel, listeners, user } = this.state;

    if (channel && user) {
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
      .child(this.state.user.uid)
      .child("starred")
      .once("value")
      .then(data => {
        if (data.val() !== null) {
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(this.state.channel.id);
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
      // console.log("star");
      this.state.usersRef.child(`${this.state.user.uid}/starred`).update({
        [this.state.channel.id]: {
          name: this.state.channel.name,
          details: this.state.channel.details,
          createdBy: {
            name: this.state.channel.createdBy.name,
            avatar: this.state.channel.createdBy.avatar
          }
        }
      });
    } else {
      // console.log("unstar");
      this.state.usersRef
        .child(`${this.state.user.uid}/starred`)
        .child(this.state.channel.id)
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
    // setTimeout for Loading Animation
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
            .filter(k => !k.includes(this.state.user.uid))
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
            .filter(k => !k.includes(this.state.channel.uid))
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
    this.props.setTopUsers(topUsers);
  };

  handleMessageAdded = channelId => {
    let loadedMessages = [];
    const ref = this.getMessagesRef();
    ref.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        loading: false
      });
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
    return this.state.privateChannel ? privateMessagesRef : messagesRef;
  };

  displayChannelName = channel =>
    channel ? `${this.state.privateChannel ? "@" : "#"}${channel.name}` : null;

  displayMessages = messages =>
    messages.length > 0 &&
    messages.map(message => (
      <Message
        key={message.timestamp}
        message={message}
        currentUser={this.state.user}
      />
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
          privateChannel={this.state.privateChannel}
          channelName={this.displayChannelName(channel)}
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
        <MessageForm
          currentUser={this.state.user}
          currentChannel={this.state.channel}
          isPrivateChannel={this.state.privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </React.Fragment>
    );
  }
}

export default connect(
  null,
  { setTopUsers }
)(Messages);
