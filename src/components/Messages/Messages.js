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
    loading: false
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

  addListeners = channelId => {
    this.setState({ loading: true });
    const ref = this.getMessagesRef();
    ref.child(channelId).on("child_added", snap => {
      this.setState({
        messages: [snap.val(), ...this.state.messages],
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
    `${this.props.isPrivateChannel ? "@" : "#"}${channel.name}`;

  displayMessages = messages =>
    messages.length > 0 && messages.map(message => (
      <Message key={message.timestamp} message={message} />
    ));

  displaySkeleton = loading =>
    !loading ? (<React.Fragment>
      {[...Array(10)].map((_, i) => <Skeleton key={i} />)}
    </React.Fragment>
  ) : null;

  render() {
    const { channel, messages, loading } = this.state;

    return (
      <React.Fragment>
        <MessagesHeader channel={channel && this.getChannelName(channel)} />
        <div>
          <Segment>
            <Comment.Group style={{ height: "400px", overflowY: "scroll" }}>
              {this.displaySkeleton(loading)}
              {this.displayMessages(messages)}
            </Comment.Group>
          </Segment>
          <MessageForm />
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel
});

export default connect(mapStateToProps)(Messages);
