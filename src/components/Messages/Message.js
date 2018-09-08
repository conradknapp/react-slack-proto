import React from "react";
import moment from "moment";
import { Comment, Image } from "semantic-ui-react";

class Message extends React.Component {
  state = {
    image: false,
    user: this.props.currentUser
  };

  componentDidMount() {
    this.isImage(this.props.message);
  }

  isImage = message => {
    const image =
      message.hasOwnProperty("image") && !message.hasOwnProperty("content");
    this.setState({ image });
  };

  isOwnMessage = message =>
    message.user.id === this.state.user.uid ? "message__self" : null;

  fromNow = time => moment(time).fromNow();

  render() {
    const { image } = this.state;
    const { message } = this.props;

    return (
      <Comment>
        <Comment.Avatar src={message.user.avatar} />
        <Comment.Content className={this.isOwnMessage(message)}>
          <Comment.Author as="a">{message.user.name}</Comment.Author>
          <Comment.Metadata>{this.fromNow(message.timestamp)}</Comment.Metadata>
          {image ? (
            <Image src={message.image} className="message__image" />
          ) : (
            <Comment.Text>{message.content}</Comment.Text>
          )}
        </Comment.Content>
      </Comment>
    );
  }
}

export default Message;
