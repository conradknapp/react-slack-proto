import React from "react";
import firebase from "../../firebase";
// prettier-ignore
import { Sidebar, Menu, Divider, Modal, Input, Button, Icon, Message } from "semantic-ui-react";

import { connect } from "react-redux";
import { setColors, resetColors } from "../../actions";

class ColorPanel extends React.Component {
  state = {
    colors: [],
    usersRef: firebase.database().ref("users"),
    primary: "",
    secondary: "",
    modal: false,
    errors: []
  };

  componentDidMount() {
    this.addListener();
  }

  componentWillUnmount() {
    this.removeListener();
  }

  addListener = () => {
    let colors = [];
    this.state.usersRef
      .child(`${this.props.currentUser.uid}/colors`)
      .on("child_added", snap => {
        colors.unshift(snap.val());
        this.setState({ colors });
      });
  };

  removeListener = () => {};

  handleChange = event =>
    this.setState({ [event.target.name]: event.target.value.trim() });

  openModal = () =>
    this.setState({ modal: true, primary: "", secondary: "", errors: [] });

  closeModal = () => this.setState({ modal: false });

  handleSaveColors = () => {
    if (this.state.primary && this.state.secondary) {
      this.saveColors();
    } else {
      this.setState({
        errors: [...this.state.errors, { message: "Fill out all fields" }]
      });
    }
  };

  saveColors = () => {
    this.state.usersRef
      .child(`${this.props.currentUser.uid}/colors`)
      .push()
      .update({
        primary: this.state.primary,
        secondary: this.state.secondary
      })
      .then(() => {
        console.log("Colors saved!");
        this.closeModal();
      })
      .catch(err => console.error(err));
  };

  displayColors = colors =>
    colors.map((color, i) => (
      <React.Fragment key={i}>
        <Divider />
        <div
          className="color__container"
          onClick={() => this.props.setColors(color.primary, color.secondary)}
        >
          <div
            className="color__square"
            style={{
              background: color.primary
            }}
          >
            <div
              className="color__overlay"
              style={{
                background: color.secondary
              }}
            />
          </div>
        </div>
        {/* <div
          className="color__preview"
          style={{
            display: 'inline-block',
            borderTop: `35px solid ${color.primary}`,
            borderBottom: `35px solid ${color.secondary}`,
          }}
        /> */}
      </React.Fragment>
    ));

  displayErrors = errors =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  render() {
    const { modal, errors, colors } = this.state;

    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
      >
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModal} />
        {colors.length > 0 && this.displayColors(colors)}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Choose App Colors (Hex or String)</Modal.Header>
          <Modal.Content>
            <Input
              fluid
              type="text"
              label="Primary Color"
              name="primary"
              onChange={this.handleChange}
            />
            <Input
              fluid
              type="text"
              label="Secondary Color"
              name="secondary"
              onChange={this.handleChange}
            />
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSaveColors}>
              <Icon name="checkmark" /> Save Colors
            </Button>
            <Button basic color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
        </Modal>
        {/* <Image
          onClick={() => this.props.setColors("blue", "green")}
          style={{ width: "30px" }}
          src="https://images.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.titanui.com%2Fwp-content%2Fuploads%2F2016%2F07%2F17%2FFresh-Blurry-Gradient-Background-Vector-150x150.png&f=1"
        />
        <Divider />
        <Image
          style={{ width: "30px" }}
          src="https://images.duckduckgo.com/iu/?u=http%3A%2F%2Fonlineteachingtoolkit.com%2Fwp-content%2Fuploads%2F2013%2F07%2Fred-black-gradient-150x150.jpg&f=1"
        />
        <Divider />
        <Image
          style={{ width: "30px" }}
          src="https://images.duckduckgo.com/iu/?u=http%3A%2F%2Fonlineteachingtoolkit.com%2Fwp-content%2Fuploads%2F2013%2F07%2Fblue-black-gradient-150x150.jpg&f=1"
        /> */}
      </Sidebar>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: state.user.currentUser
});

export default connect(
  mapStateToProps,
  { setColors, resetColors }
)(ColorPanel);
