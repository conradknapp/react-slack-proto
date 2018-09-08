import React from "react";
import firebase from "./firebase";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { setUser, logoutUser } from "./actions";
import Spinner from "./Spinner";

const withAuthorization = Component => {
  class WithAuthorization extends React.Component {
    componentDidMount() {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          // console.log(user);
          this.props.setUser(user);
          this.props.history.push("/");
        } else {
          this.props.logoutUser();
          this.props.history.push("/login");
        }
      });
    }
    render() {
      return this.props.isLoading ? <Spinner /> : <Component />;
    }
  }

  const mapStateToProps = state => ({
    isLoading: state.user.isLoading
  });

  return withRouter(
    connect(
      mapStateToProps,
      { setUser, logoutUser }
    )(WithAuthorization)
  );
};

export default withAuthorization;
