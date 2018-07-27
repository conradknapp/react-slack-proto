import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";

import { createStore } from "redux";
import { Provider, connect } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import root_reducer from "./reducers";
import { setUser } from "./actions";

import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

// Import Semantic UI Styles
import "semantic-ui-css/semantic.min.css";
import { Dimmer, Loader } from "semantic-ui-react";

import firebase from "./firebase";

const store = createStore(root_reducer, composeWithDevTools());

class WithAuthorization extends React.Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.props.setUser(user);
      } else {
        this.props.setUser(null, false);
      }
    });
  }

  render() {
    const { isAuthenticated, isLoading } = this.props;
    return isLoading ? (
      <Dimmer active>
        <Loader size="big" />
      </Dimmer>
    ) : (
      <React.Fragment>{this.props.render({ isAuthenticated })}</React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.user.isAuthenticated,
  isLoading: state.user.isLoading
});

WithAuthorization = connect(
  mapStateToProps,
  { setUser }
)(WithAuthorization);

const PrivateRoute = ({ component: Component, isAuthenticated, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isAuthenticated ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: "/login",
            state: { from: props.location }
          }}
        />
      )
    }
  />
);

const Root = () => (
  <WithAuthorization
    render={({ isAuthenticated }) => (
      <Router>
        <React.Fragment>
          <PrivateRoute
            exact
            path="/"
            component={App}
            isAuthenticated={isAuthenticated}
          />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
        </React.Fragment>
      </Router>
    )}
  />
);

ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById("root")
);
