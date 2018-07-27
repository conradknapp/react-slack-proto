import React from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
// prettier-ignore
import { Icon, Menu, Label, Modal, Message, Button, Input, Form } from "semantic-ui-react";
import { setCurrentChannel, setPrivateChannel } from "../../actions";

class Channels extends React.Component {
  state = {
    active: "",
    channels: [],
    channelName: "",
    channelDetails: "",
    errors: [],
    modal: false,
    channelsRef: firebase.database().ref("channels"),
    messagesRef: firebase.database().ref("messages"),
    firstLoad: true,
    notificationCount: []
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
    this.state.channelsRef.on("child_added", snap => {
      // this.addCountListener(snap.key);
      this.setState({ channels: [...this.state.channels, snap.val()] });
      if (this.state.firstLoad && this.state.channels.length > 0) {
        this.props.setCurrentChannel(this.state.channels[0]);
      }
      this.setState({ firstLoad: false });
    });
  };

  removeListeners = () => this.state.channelsRef.off();

  addChannel = () => {
    const { channelsRef, channelName, channelDetails } = this.state;
    const key = channelsRef.push().key;

    const createdChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: this.props.currentUser.displayName,
        avatar: this.props.currentUser.photoURL
      }
    };

    this.state.channelsRef
      .child(key)
      .update(createdChannel)
      .then(() => {
        this.setState({ channelName: "", channelDetails: "" });
        this.closeModal();
        console.log("Channel added");
      })
      .catch(err => {
        console.error(err);
        this.setState({
          errors: [...this.state.errors, { message: err.message }]
        });
      });
  };

  handleChange = event =>
    this.setState({ [event.target.name]: event.target.value.trim() });

  handleSubmit = event => {
    event.preventDefault();
    if (this.state.channelName && this.state.channelDetails) {
      this.addChannel();
    } else {
      this.setState({
        errors: [...this.state.errors, { message: "Fill out all fields" }]
      });
    }
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleItemClick = channel => {
    this.setState({ active: channel.id });
  };

  changeChannel = channel => {
    this.handleItemClick(channel);
    this.props.setPrivateChannel(false);
    this.props.setCurrentChannel(channel);
  };

  displayChannels = channels =>
    channels.map(channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.7 }}
        active={channel.id === this.state.active}
        //className={this.setActiveChannel(channel) ? "active" : ""}
      >
        <Label color="red">2</Label>
        # {channel.name}
      </Menu.Item>
    ));
  // handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    const { errors, modal, channels } = this.state;
    // const { activeItem } = this.state;

    return (
      <React.Fragment>
        <Menu.Menu style={{ paddingBottom: "2em" }}>
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>{" "}
            ({this.state.channels.length}){" "}
            <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {channels.length > 0 && this.displayChannels(channels)}
        </Menu.Menu>
        {/* divider */}

        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Channel"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
              {errors.length > 0 && (
                <Message inverted color="red">
                  <h3>Error</h3>
                  {this.displayErrors(errors)}
                </Message>
              )}
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.addChannel}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button basic color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  currentChannel: state.channel.currentChannel,
  currentUser: state.user.currentUser
});

export default connect(
  mapStateToProps,
  { setCurrentChannel, setPrivateChannel }
)(Channels);
