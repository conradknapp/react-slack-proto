import * as actionTypes from "./types";

/* User Actions */
export const setUser = user => {
  return {
    type: actionTypes.SET_USER,
    payload: {
      currentUser: user
    }
  };
};

export const logoutUser = () => {
  return {
    type: actionTypes.LOGOUT_USER,
    payload: {
      currentUser: null
    }
  };
};

/* Channel Actions */
export const setCurrentChannel = channel => {
  return {
    type: actionTypes.SET_CURRENT_CHANNEL,
    payload: {
      currentChannel: channel
    }
  };
};

export const setPrivateChannel = isPrivateChannel => {
  return {
    type: actionTypes.SET_PRIVATE_CHANNEL,
    payload: {
      isPrivateChannel
    }
  };
};

export const setTopUsers = topUsers => {
  return {
    type: actionTypes.SET_TOP_USERS,
    payload: {
      topUsers
    }
  };
};

/* Color Actions */
export const setColors = (primaryColor, secondaryColor) => {
  return {
    type: actionTypes.SET_COLORS,
    payload: {
      primaryColor,
      secondaryColor
    }
  };
};

export const resetColors = () => {
  return {
    type: actionTypes.RESET_COLORS
  };
};
