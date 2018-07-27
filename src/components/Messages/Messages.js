import React from "react";
// prettier-ignore
import { Segment, Comment } from "semantic-ui-react";

import Message from "./Message";
import MessageForm from "./MessageForm";

class Messages extends React.Component {
  render() {
    return (
      <div>
        <Segment loading={false}>
          <Comment.Group style={{ height: "400px", overflowY: "scroll" }}>
            <Message />
            <Message />
            <Message />
            <Message />
            <Message />
            <Message />
            <Message />
            <Message />
            <Message />
            <Message />
          </Comment.Group>
        </Segment>
        <MessageForm />
      </div>
    );
  }
}

export default Messages;
