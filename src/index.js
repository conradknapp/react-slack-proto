import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { createStore } from "redux";
import { Provider } from "react-redux";
import { composeWithDevTools } from "redux-devtools-extension";
import root_reducer from "./reducers";

import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

// Import Semantic UI Styles
import "semantic-ui-css/semantic.min.css";

const store = createStore(root_reducer, composeWithDevTools());

const Root = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
    </Switch>
  </Router>
);

ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById("root")
);
