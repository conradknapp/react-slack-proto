import * as actionTypes from "../actions/types";

const initialState = {
  primaryColor: "#4c3c4c",
  secondaryColor: "green"
};

export default (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_COLORS:
      return {
        primaryColor: action.payload.primaryColor,
        secondaryColor: action.payload.secondaryColor
      };
    case actionTypes.RESET_COLORS:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
