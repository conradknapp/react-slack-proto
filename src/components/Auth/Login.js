import React from "react";
import firebase from "../../firebase";
//prettier-ignore
import { Button, Form, Grid, Header, Message, Segment, Icon } from 'semantic-ui-react';
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { setUser } from "../../actions";

class Login extends React.Component {
  state = {
    email: "",
    password: "",
    errors: [],
    loading: false
  };

  handleChange = event =>
    this.setState({ [event.target.name]: event.target.value.trim() });

  isFormValid = () => this.state.email && this.state.password;

  loginUser = () => {
    if (this.isFormValid()) {
      this.setState({ errors: [], loading: true });
      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .then(signedInUser => {
          this.props.setUser(signedInUser.user);
          this.props.history.push("/");
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

  displayErrors = () =>
    this.state.errors.map((error, i) => <p key={i}>{error.message}</p>);

  render() {
    const { email, password, errors, loading } = this.state;

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="violet" textAlign="center">
            <Icon name="code branch" color="violet" />
            Login to DevChat
          </Header>
          <Form size="large" onSubmit={this.loginUser} className="error">
            <Segment stacked>
              <Form.Input
                fluid
                name="email"
                icon="user"
                iconPosition="left"
                placeholder="E-mail address"
                onChange={this.handleChange}
                value={email}
                className={
                  errors.some(el => el.message.includes("email")) ? "error" : ""
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
              <Button
                color="violet"
                fluid
                size="large"
                className={loading ? "loading" : ""}
              >
                Submit
              </Button>
            </Segment>
          </Form>
          {!!errors.length && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors()}
            </Message>
          )}
          <Message>
            Don't have an account? <Link to="/register">Register</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default connect(
  null,
  { setUser }
)(Login);
