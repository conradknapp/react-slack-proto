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
    channels: [],
    channelName: "",
    channelDetails: "",
    errors: [],
    modal: false,
    channelsRef: firebase.database().ref("channels"),
    messagesRef: firebase.database().ref("messages"),
    initialLoad: true
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
    let channels = [];
    this.state.channelsRef.on("child_added", snap => {
      channels.push(snap.val());
      this.setState({ channels });
      if (this.state.initialLoad && this.state.channels.length > 0) {
        this.props.setCurrentChannel(this.state.channels[0]);
      }
      this.setState({ initialLoad: false });

      this.addCountListener(snap.key);
    });
  };

  addCountListener = channelId => {
    this.state.messagesRef.child(channelId).on("value", snap => {
      this.handleNotifications(
        channelId,
        this.props.currentChannel.id,
        this.state.countNotifs,
        snap
      );
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
    this.state.messagesRef.off();
  };

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
        {this.getNotifications(channel) && (
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
            ({channels.length})
            <Icon name="add" onClick={this.openModal} />
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

const mapStateToProps = state => ({
  currentChannel: state.channel.currentChannel,
  currentUser: state.user.currentUser
});

export default connect(
  mapStateToProps,
  { setCurrentChannel, setPrivateChannel }
)(Channels);
