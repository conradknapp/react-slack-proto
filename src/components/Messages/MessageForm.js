import React from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { Segment, Button, Input } from "semantic-ui-react";
import uuidv4 from "uuid/v4";
import { Picker } from "emoji-mart";
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
    emojiPicker: false
  };

  componentWillUnmount() {
    if (this.state.uploadTask !== null) {
      this.state.uploadTask.cancel();
      this.setState({ uploadTask: null });
    }
  }

  handleChange = event =>
    this.setState({ [event.target.name]: event.target.value });

  handleKeyDown = event => {
    if (event.keyCode === 13 && event.ctrlKey) {
      this.sendMessage();
    }
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  toggleEmojiPicker = event =>
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
    const { currentChannel, getMessagesRef } = this.props;

    getMessagesRef()
      .child(currentChannel.id)
      .push()
      .set(this.createMessage())
      .then(() => {
        this.setState({ message: "" });
      })
      .catch(err => {
        console.error(err);
        this.setState({
          errors: [...this.state.errors, { message: err.message }]
        });
      });
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

  render() {
    const {
      modal,
      message,
      percentUploaded,
      uploadState,
      emojiPicker
    } = this.state;

    return (
      <Segment className="messages__form">
        {emojiPicker && (
          <Picker
            set="emojione"
            onSelect={data => console.log(data)}
            className="emojipicker"
            title="Pick your emoji"
            emoji="point_up"
          />
        )}
        <Input
          fluid
          name="message"
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
          uploadState={uploadState}
          percentUploaded={percentUploaded}
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
