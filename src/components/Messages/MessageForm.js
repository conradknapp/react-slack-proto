import React from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { Segment, Button, Input } from "semantic-ui-react";
import uuidv4 from "uuid/v4";
import { Picker, emojiIndex } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";

class MessageForm extends React.Component {
  state = {
    message: "",
    errors: [],
    modal: false,
    uploadTask: null,
    uploadState: null,
    percentUploaded: 0,
    storageRef: firebase.storage().ref(),
    typingRef: firebase.database().ref("isTyping"),
    emojiPicker: false,
    loading: false
  };

  // componentDidMount() {
  //   this.messageInputRef.focus();
  // }

  componentWillUnmount() {
    if (this.state.uploadTask !== null) {
      this.state.uploadTask.cancel();
      this.setState({ uploadTask: null });
    }
  }

  handleChange = event =>
    this.setState({ [event.target.name]: event.target.value });

  handleKeyDown = event => {
    if (event.ctrlKey && event.keyCode === 13) {
      this.sendMessage();
    }
    if (this.state.message) {
      this.state.typingRef
        .child(this.props.currentChannel.id)
        .child(this.props.currentUser.uid)
        .set(this.props.currentUser.displayName);
    } else {
      this.state.typingRef
        .child(this.props.currentChannel.id)
        .child(this.props.currentUser.uid)
        .remove();
    }
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  toggleEmojiPicker = () =>
    this.setState({ emojiPicker: !this.state.emojiPicker });

  createMessage = (fileUrl = null) => {
    let message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        name: this.props.currentUser.displayName,
        avatar: this.props.currentUser.photoURL,
        id: this.props.currentUser.uid
      }
    };
    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = this.state.message;
    }
    return message;
  };

  sendMessage = () => {
    const { currentChannel, currentUser, getMessagesRef } = this.props;

    if (this.state.message) {
      this.setState({ loading: true });
      getMessagesRef()
        .child(currentChannel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ message: "", errors: [], loading: false });
          this.state.typingRef
            .child(currentChannel.id)
            .child(currentUser.uid)
            .remove();
        })
        .catch(err => {
          console.error(err);
          this.setState({
            loading: false,
            errors: [...this.state.errors, { message: err.message }]
          });
        });
    } else {
      this.setState({
        errors: [...this.state.errors, { message: "Add a message " }]
      });
    }
  };

  uploadFile = (file, metadata) => {
    if (file === null) return false;

    const pathToUpload = this.props.currentChannel.id;
    const ref = this.props.getMessagesRef();
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
      },
      () => {
        this.state.uploadTask.on(
          "state_changed",
          snap => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.setState({ percentUploaded });
          },
          err => {
            console.error(err);
            this.setState({
              errors: [...this.state.errors, { message: err.message }],
              uploadState: "error",
              uploadTask: null
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then(downloadUrl => {
                this.sendFileMessage(downloadUrl, ref, pathToUpload);
              })
              .catch(err => {
                console.error(err);
                this.setState({
                  errors: [...this.state.errors, { message: err.message }],
                  uploadState: "error",
                  uploadTask: null
                });
              });
          }
        );
      }
    );
  };

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState: "done" });
      })
      .catch(err => {
        console.error(err);
        this.setState({
          errors: [...this.state.errors, { message: err.message }]
        });
      });
  };

  getPath = () => {
    if (this.props.isPrivateChannel) {
      return `chat/private-${this.props.currentChannel.id}`;
    } else {
      return "chat/public";
    }
  };

  colonToUnicode = message => {
    // Takes string and returns string (Converts colon emoji to unicode)
    return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      // If no unicode found, return colon itself
      return x;
    });
  };

  handleAddEmoji = emoji => {
    let oldMessage = this.state.message;
    let newMessage = this.colonToUnicode(`${oldMessage} ${emoji.colons} `);
    this.setState({ message: newMessage, emojiPicker: false });
    // focus in textarea on choosing emoji
    setTimeout(() => this.messageInputRef.focus(), 100);
  };

  render() {
    const {
      modal,
      message,
      percentUploaded,
      uploadState,
      emojiPicker,
      errors,
      loading
    } = this.state;

    return (
      <Segment className="messages__form">
        {emojiPicker && (
          <Picker
            set="apple"
            onSelect={this.handleAddEmoji}
            className="emojipicker"
            title="Pick your emoji"
            emoji="point_up"
          />
        )}
        <Input
          fluid
          ref={c => (this.messageInputRef = c)}
          className={
            errors.some(el => el.message.includes("message")) ? "error" : ""
          }
          name="message"
          style={{ marginBottom: "0.7em" }}
          onKeyDown={this.handleKeyDown}
          onChange={this.handleChange}
          label={
            <Button
              icon={emojiPicker ? "close" : "add"}
              onClick={this.toggleEmojiPicker}
              content={emojiPicker ? "Close" : null}
            />
          }
          value={message}
          labelPosition="left"
          placeholder="Write your message"
        />
        <Button.Group icon widths="2">
          <Button
            color="orange"
            content="Add Reply"
            labelPosition="left"
            icon="edit"
            onClick={this.sendMessage}
            disabled={loading}
          />
          <Button
            color="teal"
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
            disabled={uploadState === "uploading"}
            onClick={this.openModal}
          />
        </Button.Group>
        <FileModal
          modal={modal}
          closeModal={this.closeModal}
          uploadFile={this.uploadFile}
        />
        <ProgressBar
          percentUploaded={percentUploaded}
          uploadState={uploadState}
        />
      </Segment>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel
});

export default connect(mapStateToProps)(MessageForm);
