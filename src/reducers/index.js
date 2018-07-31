import { combineReducers } from "redux";
import user_reducer from "./user_reducer";
import channel_reducer from "./channel_reducer";
import color_reducer from "./color_reducer";

const rootReducer = combineReducers({
  user: user_reducer,
  channel: channel_reducer,
  color: color_reducer
});

export default rootReducer;
