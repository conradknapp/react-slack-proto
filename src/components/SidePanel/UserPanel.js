import React from "react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
// prettier-ignore
import {
 Dropdown, Icon, Header, Grid, Image, Modal, Input, Message, Button } from "semantic-ui-react";
import { logoutUser } from "../../actions";
import AvatarEditor from "react-avatar-editor";

class UserPanel extends React.Component {
  state = {
    modal: false,
    errors: [],
    previewImage: "",
    croppedImage: "",
    uploadedImageURL: "",
    blob: null,
    userRef: firebase.auth().currentUser,
    storageRef: firebase.storage().ref(),
    metadata: {
      contentType: "image/jpeg"
    }
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
    firebase
      .auth()
      .signOut()
      .then(() => console.log("logged out!"));
    this.props.logoutUser();
    this.props.history.push("/login");
  };

  uploadAvatar = () => {
    const { storageRef, userRef, metadata, blob } = this.state;

    storageRef
      .child(`avatars/${userRef.uid}`)
      .put(blob, metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(downloadURL => {
          this.setState({ uploadedImageURL: downloadURL }, () =>
            this.changeAvatar()
          );
        });
      });
  };

  changeAvatar = () => {
    this.state.userRef
      .updateProfile({
        photoURL: this.state.uploadedImageURL
      })
      .then(() => {
        console.log("avatar updated");
        this.closeModal();
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
      this.editor.getImageScaledToCanvas().toBlob(blob => {
        let imageUrl = URL.createObjectURL(blob);
        this.setState({
          croppedImage: imageUrl,
          blob
        });
      });
    }
  };

  render() {
    const { modal, errors, previewImage, croppedImage } = this.state;
    const { currentUser, primaryColor } = this.props;

    return (
      <Grid inverted style={{ backgroundColor: primaryColor }}>
        <Grid.Column>
          <Grid.Row className="user__panel--row">
            <Header inverted floated="left" as="h2">
              DevChat
            </Header>

            <Header as="h4" inverted>
              {/* <Icon name="circle" color="green" /> */}
              <Dropdown
                trigger={
                  <span>
                    <Image src={currentUser.photoURL} avatar />
                    {currentUser.displayName}
                  </span>
                }
                options={this.dropdownOptions()}
              />
            </Header>
          </Grid.Row>
          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input
                fluid
                type="file"
                label="New Avatar"
                name="previewImage"
                onChange={this.handleChange}
              />
              {previewImage && (
                <AvatarEditor
                  ref={node => (this.editor = node)}
                  image={previewImage}
                  width={100}
                  height={100}
                  border={50}
                  scale={1.2}
                />
              )}
              {croppedImage && <Image src={croppedImage} />}
              {errors.length > 0 && (
                <Message color="red">
                  <h3>Error</h3>
                  {this.displayErrors(errors)}
                </Message>
              )}
            </Modal.Content>
            <Modal.Actions>
              {croppedImage && (
                <Button color="green" inverted onClick={this.uploadAvatar}>
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
        </Grid.Column>
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  primaryColor: state.color.primaryColor
});

export default withRouter(
  connect(
    mapStateToProps,
    { logoutUser }
  )(UserPanel)
);
