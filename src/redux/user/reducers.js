import { CLEAR_USER, SET_USER } from "./action";

export const userReducer = (state = null, action) => {
    // gets called everytime dispatch function is called irrespective of action and payload
    switch (action.type) {
        // this helps in login functionality
        case SET_USER:
            return action.payload;
        // this case helps in logout functionality
        case CLEAR_USER:
            return null;
        // this case helps in handling cases where userReducer is invoked due to 
        // change in some other state variable maintained by redux
        default:
            return state;
    }
}