import React from "react";
import { Segment, Button, Form, Input } from "semantic-ui-react";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";

// import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";

class MessageForm extends React.Component {
  state = {
    emojiPicker: false
  };

  toggleEmojiPicker = () =>
    this.setState({ emojiPicker: !this.state.emojiPicker });

  render() {
    const { emojiPicker } = this.state;

    return (
      <Segment className="messages__form">
        {emojiPicker && (
          <Picker
            set="emojione"
            onSelect={data => console.log(data)}
            style={{ position: "absolute", bottom: "140px" }}
            title="Pick your emoji"
            emoji="point_up"
          />
        )}
        <Form style={{ position: "relative" }}>
          <Input
            fluid
            ref="message"
            name="message"
            label={
              <Button
                icon={emojiPicker ? "close" : "add"}
                onClick={this.toggleEmojiPicker}
                content={emojiPicker ? "Close" : null}
              />
            }
            labelPosition="left"
            placeholder="Write your message"
          />
          <Button.Group icon widths="2">
            <Button
              color="orange"
              content="Add Reply"
              labelPosition="left"
              icon="edit"
            />
            <Button
              color="teal"
              content="Upload Media"
              labelPosition="right"
              icon="cloud upload"
            />
          </Button.Group>
        </Form>
        {/* <FileModal
          modalOpen={modalOpen}
          closeFileModal={this.closeFileModal}
          uploadFile={this.uploadFile}
        /> */}
        <ProgressBar
          // uploadState={uploadState}
          percentUploaded={"75"}
        />
      </Segment>
    );
  }
}

export default MessageForm;
