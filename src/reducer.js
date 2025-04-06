import { SAVE_YT_URL } from "./actions";

const initialState = {
  ytUrl: "",
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case SAVE_YT_URL:
      return { ...state, ytUrl: action.payload };
    default:
      return state;
  }
};

export default rootReducer;