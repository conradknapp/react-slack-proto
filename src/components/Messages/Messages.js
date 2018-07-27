import React from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
// prettier-ignore
import { Segment, Comment } from "semantic-ui-react";

import Message from "./Message";
import MessageForm from "./MessageForm";
import MessagesHeader from "./MessagesHeader";
import Skeleton from "./Skeleton";

class Messages extends React.Component {
  state = {
    messagesRef: firebase.database().ref("messages"),
    privateMessagesRef: firebase.database().ref("privateMessages"),
    messages: [],
    listeners: [],
    channel: null,
    loading: true,
    searchTerm: "",
    searchResults: [],
    uniqueUsers: null
  };

  handleSearchChange = event => {
    this.setState({ searchTerm: event.target.value }, () =>
      this.handleSearch()
    );
  };

  static getDerivedStateFromProps(props, state) {
    // prettier-ignore
    if (state.channel === null || props.currentChannel.id !== state.channel.id) {
      return {
        messages: [],
        channel: props.currentChannel
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
    }
  }

  componentWillUnmount() {
    this.detachListeners(this.state.listeners);
  }

  handleSearch = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResults = channelMessages.reduce((acc, message) => {
      if (message.content.match(regex) || message.user.name.match(regex)) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
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

  addListeners = channelId => {
    this.setState({ loading: false });
    const ref = this.getMessagesRef();
    ref.child(channelId).on("child_added", snap => {
      let messages = [snap.val(), ...this.state.messages];
      this.countUniqueUsers(messages);
      this.setState({
        messages,
        loading: false
      });
    });
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
        {[...Array(10)].map((_, i) => <Skeleton key={i} />)}
      </React.Fragment>
    ) : null;

  render() {
    const {
      channel,
      messages,
      loading,
      searchTerm,
      searchResults,
      uniqueUsers
    } = this.state;

    return (
      <React.Fragment>
        <MessagesHeader
          channel={this.getChannelName(channel)}
          handleSearchChange={this.handleSearchChange}
          uniqueUsers={uniqueUsers}
        />
        <Segment>
          <Comment.Group className="messages">
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
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel
});

export default connect(mapStateToProps)(Messages);
