import React from "react";
import { Comment, Image } from "semantic-ui-react";

class Message extends React.Component {
  state = {
    image: false
  };

  render() {
    const { image } = this.state;

    return (
      <Comment>
        <Comment.Avatar src="https://react.semantic-ui.com/images/avatar/small/elliot.jpg" />
        <Comment.Content>
          <Comment.Author as="a">Jeffrey</Comment.Author>
          <Comment.Metadata>Today at 5:42PM</Comment.Metadata>
          {image ? (
            <Image src="" />
          ) : (
            <Comment.Text>
              This has been very useful for my research. Thanks as well!
            </Comment.Text>
          )}
        </Comment.Content>
      </Comment>
    );
  }
}

export default Message;
