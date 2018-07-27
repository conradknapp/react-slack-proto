import * as actionTypes from "../actions/types";

const initialState = {
  currentUser: null,
  isAuthenticated: false,
  isLoading: true
};

export default (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        currentUser: action.payload.currentUser,
        isAuthenticated: action.payload.isAuthenticated,
        isLoading: false
      };
    case actionTypes.LOGOUT_USER:
      return { ...initialState };
    default:
      return state;
  }
};
