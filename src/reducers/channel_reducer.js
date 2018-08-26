import * as actionTypes from "../actions/types";

const initialState = {
  currentChannel: null,
  topUsers: null,
  isPrivateChannel: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_CHANNEL:
      return {
        ...state,
        currentChannel: action.payload.currentChannel
      };
    case actionTypes.SET_PRIVATE_CHANNEL:
      return {
        ...state,
        isPrivateChannel: action.payload.isPrivateChannel
      };
    case actionTypes.SET_TOP_USERS:
      return {
        ...state,
        topUsers: action.payload.topUsers
      };
    default:
      return state;
  }
};
