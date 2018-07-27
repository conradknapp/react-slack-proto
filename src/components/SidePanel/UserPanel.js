import React from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
// prettier-ignore
import {
 Dropdown, Icon, Header, Segment, Image as Img, Modal, Input, Button, Message } from "semantic-ui-react";
import { logoutUser } from "../../actions";
import AvatarEditor from "react-avatar-editor";

class UserPanel extends React.Component {
  state = {
    modal: false,
    errors: [],
    previewImage: "",
    croppedImage: "",
    userRef: firebase.auth().currentUser
    // presenceRef: firebase.database().ref("presence")
  };

  dropdownOptions = () => [
    {
      key: "user",
      text: (
        <span>
          Signed in as <strong>{this.props.currentUser.displayName}</strong>
        </span>
      ),
      disabled: true
    },
    {
      key: "profile",
      text: <span onClick={this.openModal}>Change Avatar</span>
    },
    {
      key: "sign-out",
      text: <span onClick={this.logoutUser}>Sign Out</span>
    }
  ];

  logoutUser = () => {
    // this.state.presenceRef.child(this.props.currentUser.uid).remove();
    firebase
      .auth()
      .signOut()
      .then(() => console.log("logged out!"));
    this.props.logoutUser();
    this.props.history.push("/login");
  };

  setEditorRef = editor => (this.editor = editor);

  changeAvatar = () => {
    const { croppedImage } = this.state;

    this.state.userRef
      .updateProfile({
        photoURL: croppedImage
      })
      .then(() => {
        console.log("avatar updated");
        //this.closeModal();
      })
      .catch(err => {
        console.error(err);
        this.setState({
          errors: [...this.state.errors, { message: err.message }]
        });
      });
  };

  openModal = () =>
    this.setState({ modal: true, croppedImage: "", previewImage: "" });

  closeModal = () => this.setState({ modal: false });

  handleChange = event => {
    const file = event.target.files[0];
    const reader = new FileReader();

    if (!file) {
      this.setState({
        errors: [...this.state.errors, { message: "No file found" }]
      });
    } else {
      reader.readAsDataURL(file);
    }
    reader.addEventListener(
      "load",
      () => this.setState({ previewImage: reader.result }),
      false
    );
  };

  displayErrors = errors =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  onClickSave = () => {
    if (this.editor) {
      const canvasScaled = this.editor
        .getImageScaledToCanvas()
        .toDataURL("image/jpeg");
      this.setState({ croppedImage: canvasScaled });
    }
  };

  render() {
    const { modal, errors, previewImage, croppedImage } = this.state;
    // const { currentUser } = this.props;

    return (
      <Segment clearing inverted style={{ backgroundColor: "#4c3c4c" }}>
        <Header floated="left" as="h3">
          <Dropdown
            trigger={<span>DevChat</span>}
            options={this.dropdownOptions()}
          />
        </Header>
        <Header floated="right">
          <Icon.Group>
            <Icon name="bell outline" />
            <Icon corner className="top right" name="circle" color="blue" />
          </Icon.Group>
        </Header>
        {/* <Item>
          {currentUser.displayName}
          <Icon name="circle" color="green" />
        </Item> */}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a channel</Modal.Header>
          <Modal.Content>
            <Input
              fluid
              type="file"
              label="New Avatar"
              name=""
              onChange={this.handleChange}
            />
            {previewImage && (
              <AvatarEditor
                ref={this.setEditorRef}
                image={previewImage}
                width={50}
                height={50}
                border={50}
                scale={1.2}
              />
            )}
            {croppedImage && <Img src={croppedImage} />}
            {errors.length > 0 && (
              <Message color="red">
                <h3>Error</h3>
                {this.displayErrors(errors)}
              </Message>
            )}
          </Modal.Content>
          <Modal.Actions>
            {croppedImage && (
              <Button color="green" inverted onClick={this.changeAvatar}>
                <Icon name="checkmark" /> Change Avatar
              </Button>
            )}
            <Button color="green" inverted onClick={this.onClickSave}>
              <Icon name="checkmark" /> Preview
            </Button>
            <Button basic color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Segment>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: state.user.currentUser
});

export default withRouter(
  connect(
    mapStateToProps,
    { logoutUser }
  )(UserPanel)
);
