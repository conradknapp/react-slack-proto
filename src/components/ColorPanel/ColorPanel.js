import React from "react";
import firebase from "../../firebase";
// prettier-ignore
import { Sidebar, Menu, Divider, Modal, Button, Icon, Message, Label } from "semantic-ui-react";
import { SliderPicker } from "react-color";

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

  handleChangePrimary = color => this.setState({ primary: color.hex });

  handleChangeSecondary = color => this.setState({ secondary: color.hex });

  openModal = () =>
    this.setState({ modal: true, primary: "", secondary: "", errors: [] });

  closeModal = () => this.setState({ modal: false });

  handleSaveColors = () => {
    if (this.state.primary) {
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
      </React.Fragment>
    ));

  displayErrors = errors =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  render() {
    const { modal, errors, colors, primary, secondary } = this.state;

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
          <Modal.Header>Choose App Colors</Modal.Header>
          <Modal.Content>
            <Label content="Primary Color" />
            <SliderPicker
              color={primary}
              onChangeComplete={this.handleChangePrimary}
            />
            <Label content="Secondary Color" />
            <SliderPicker
              color={secondary}
              onChangeComplete={this.handleChangeSecondary}
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
