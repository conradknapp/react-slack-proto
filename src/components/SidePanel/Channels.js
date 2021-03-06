import React from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
// prettier-ignore
import { Icon, Menu, Label, Modal, Message, Button, Input, Form } from "semantic-ui-react";
import { setCurrentChannel, setPrivateChannel } from "../../actions";

class Channels extends React.Component {
  state = {
    countNotifs: [],
    active: "",
    user: this.props.currentUser,
    channel: null,
    channels: [],
    channelName: "",
    channelDetails: "",
    errors: [],
    modal: false,
    channelsRef: firebase.database().ref("channels"),
    messagesRef: firebase.database().ref("messages"),
    typingRef: firebase.database().ref("isTyping"),
    initialLoad: true
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
    this.loadChannels();
  };

  loadChannels = () => {
    let loadedChannels = [];
    this.state.channelsRef.on("child_added", snap => {
      loadedChannels.push(snap.val());
      this.setState({ channels: loadedChannels });
      const firstChannel = loadedChannels[0];
      if (this.state.initialLoad && this.state.channels.length > 0) {
        this.props.setCurrentChannel(firstChannel);
      }
      this.setState({ initialLoad: false });
      this.addCountListener(snap.key);
    });
  };

  addCountListener = channelId => {
    this.state.messagesRef.child(channelId).on("value", snap => {
      if (this.props.currentChannel) {
        this.handleNotifications(
          channelId,
          this.props.currentChannel.id,
          this.state.countNotifs,
          snap
        );
      }
    });
  };

  handleNotifications = (channelId, currentChannelId, notifCount, snap) => {
    let lastTotal = 0;

    let index = notifCount.findIndex(el => el.id === channelId);
    if (index !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifCount[index].total;

        if (snap.numChildren() - lastTotal > 0) {
          notifCount[index].notif = snap.numChildren() - lastTotal;
        }
      }
      notifCount[index].lastKnownTotal = snap.numChildren();
    } else {
      notifCount.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        notif: 0
      });
    }
    this.setState({ countNotifs: notifCount });
  };

  getNotifications = channel => {
    let notif = 0;

    this.state.countNotifs.forEach(el => {
      if (el.id === channel.id) {
        notif = el.notif;
      }
    });

    if (notif > 0) return notif;
  };

  removeListeners = () => {
    this.state.channelsRef.off();
    this.state.channels.forEach(el => {
      this.state.messagesRef.child(el.id).off();
    });
  };

  addChannel = () => {
    const { channelsRef, channelName, channelDetails } = this.state;
    const key = channelsRef.push().key;

    const createdChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL
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
    this.setState({ [event.target.name]: event.target.value });

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

  handleItemClick = channel => this.setState({ active: channel.id });

  resetNotifications = () => {
    let index = this.state.countNotifs.findIndex(
      el => el.id === this.props.currentChannel.id
    );
    if (index !== -1) {
      let countNotifs = this.state.countNotifs;
      countNotifs[index].total = this.state.countNotifs[index].lastKnownTotal;
      countNotifs[index].notif = 0;
      this.setState({ countNotifs });
    }
  };

  changeChannel = channel => {
    this.state.typingRef
      .child(this.props.currentChannel.id)
      .child(this.state.user.uid)
      .remove();
    this.handleItemClick(channel);
    this.resetNotifications();
    this.props.setPrivateChannel(false);
    this.props.setCurrentChannel(channel);
    this.setState({ channel });
  };

  displayChannels = channels =>
    channels.length > 0 &&
    channels.map(channel => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.7 }}
        active={channel.id === this.state.active}
        //className={this.setActiveChannel(channel) ? "active" : ""}
      >
        {this.getNotifications(channel) &&
          channel.id !== this.props.currentChannel.id && (
            <Label color="red">{this.getNotifications(channel)}</Label>
          )}
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
            ({channels.length})<Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {this.displayChannels(channels)}
        </Menu.Menu>

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

// const mapStateToProps = state => ({
//   currentChannel: state.channel.currentChannel,
//   currentUser: state.user.currentUser
// });

export default connect(
  null,
  { setCurrentChannel, setPrivateChannel }
)(Channels);
