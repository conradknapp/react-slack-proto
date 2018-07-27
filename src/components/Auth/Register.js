import React from "react";
import firebase from "../../firebase";
import md5 from "md5";
import {
  Button,
  Form,
  Grid,
  Header,
  Message,
  Segment,
  Icon
} from "semantic-ui-react";
import { Link } from "react-router-dom";

class Register extends React.Component {
  state = {
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    errors: [],
    usersRef: firebase.database().ref("users"),
    loading: false
  };

  isFormValid = () => {
    let errors = [];
    let error;

    if (this.isFormEmpty(this.state)) {
      error = { message: "Fill in all fields" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else if (!this.isPasswordValid(this.state)) {
      error = { message: "Password is invalid" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else {
      return true;
    }
  };

  isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
    // prettier-ignore
    return !username.length || !email.length || !password.length || !passwordConfirmation.length;
  };

  isPasswordValid = ({ password, passwordConfirmation }) => {
    if (password.length < 6 || passwordConfirmation.length < 6) {
      return false;
    } else if (password !== passwordConfirmation) {
      return false;
    } else {
      return true;
    }
  };

  registerUser = event => {
    event.preventDefault();
    if (this.isFormValid()) {
      this.setState({ errors: [], loading: true });
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createdUser => {
          console.log("user registered", createdUser.user.email);
          createdUser.user
            .updateProfile({
              displayName: this.state.username,
              photoURL: `http://gravatar.com/avatar/${md5(
                createdUser.user.email
              )}?d=identicon`
            })
            .then(
              () => {
                this.saveUser(createdUser).then(() => {
                  //this.props.setUser(createdUser.user);
                  this.props.history.push("/");
                });
              },
              err => {
                console.error(err);
                this.setState({
                  loading: false,
                  errors: [...this.state.errors, { message: err.message }]
                });
              }
            );
        })
        .catch(err => {
          console.error(err);
          this.setState({
            loading: false,
            errors: [...this.state.errors, { message: err.message }]
          });
        });
    }
  };

  saveUser = createdUser => {
    return this.state.usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL
    });
  };

  handleChange = event =>
    this.setState({ [event.target.name]: event.target.value.trim() });

  displayErrors = errors =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  render() {
    // prettier-ignore
    const { username, email, password, passwordConfirmation, errors, loading } = this.state;

    return (
      <div className="login-form">
        <Grid
          textAlign="center"
          style={{ height: "100%" }}
          verticalAlign="middle"
        >
          <Grid.Column style={{ maxWidth: 450 }}>
            <Header as="h2" icon color="orange" textAlign="center">
              <Icon name="puzzle piece" color="orange" />
              Register for DevChat
            </Header>
            <Form size="large" onSubmit={this.registerUser} className="error">
              <Segment stacked>
                <Form.Input
                  fluid
                  name="username"
                  icon="user"
                  iconPosition="left"
                  placeholder="Username"
                  onChange={this.handleChange}
                  value={username}
                  required={true}
                />
                <Form.Input
                  fluid
                  name="email"
                  icon="mail"
                  iconPosition="left"
                  placeholder="E-mail address"
                  onChange={this.handleChange}
                  value={email}
                  className={
                    errors.some(el => el.message.includes("email"))
                      ? "error"
                      : ""
                  }
                  autoComplete="email"
                  required={true}
                />
                <Form.Input
                  fluid
                  icon="lock"
                  iconPosition="left"
                  placeholder="Password"
                  type="password"
                  name="password"
                  onChange={this.handleChange}
                  value={password}
                  className={
                    errors.some(el => el.message.includes("password"))
                      ? "error"
                      : ""
                  }
                  autoComplete="password"
                  required={true}
                />
                <Form.Input
                  fluid
                  icon="repeat"
                  iconPosition="left"
                  placeholder="Password Confirmation"
                  type="password"
                  name="passwordConfirmation"
                  onChange={this.handleChange}
                  value={passwordConfirmation}
                  className={
                    errors.some(el => el.message.includes("password"))
                      ? "error"
                      : ""
                  }
                  autoComplete="password"
                  required={true}
                />
                <Button
                  color="orange"
                  fluid
                  size="large"
                  className={loading ? "loading" : ""}
                >
                  Submit
                </Button>
              </Segment>
            </Form>
            {errors.length > 0 && (
              <Message error>
                <h3>Error</h3>
                {this.displayErrors(errors)}
              </Message>
            )}
            <Message>
              Already a user? <Link to="/login">Login</Link>
            </Message>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default Register;
