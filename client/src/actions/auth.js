import config from "../config";
import Axios from "axios";
import {handle as errorsHandler} from '../errorsHandler';

const SET_ERROR = 'SET_ERROR';
const BASE_URI = config.api.base_uri + "/auth";
const USER_URI = config.api.base_uri + "/users";
const LOGIN = "LOGIN";
const LOGOUT = "LOGOUT";
const REGISTER = "REGISTER";
const PASSWORD_RESET = "PASSWORD_RESET";

const handleCart = async (guestCart, { user, token }) => {
  if (guestCart.length) {
    return Axios.post(config.api.base_uri + "/orders/" + user.id, {
      status: "shopping_cart",
    }).then(async () => {
      await Axios.get(USER_URI + "/" + user.id + "/cart").then((res) => {
        //console.log(res.data);
        if (res.data && Array.isArray(res.data)) {
          res.data.forEach(async (element) => {
            let index = guestCart.findIndex(
              (item) => item.id === element.productId
            );
            if (index >= 0) {
              const cartData = {
                idProduct: element.productId,
                quantityProduct: guestCart[index].quantity,
              };
              await Axios.put(USER_URI + "/" + user.id + "/cart", cartData);
              guestCart.splice(index, 1);
            }
          });
        }
        // console.log(guestCart);
        guestCart.forEach(async (element) => {
          const cartData = {
            idProduct: element.id,
            quantityProduct: element.quantity,
          };
          await Axios.post(USER_URI + "/" + user.id + "/cart", cartData);
        });
      });
    });
  }
};

export function googleLogin({ tokenId, guestCart }) {
  return (dispatch) => {
    return Axios.post(BASE_URI + "/login-google", { tokenId })
      .then((res) => res.data)
      .then(async res => {
        await handleCart(guestCart, res)
        dispatch({ type: LOGIN, payload: res }); // res = {user:{}, token:''}
        return res;
      })
      .catch(() => {
        dispatch({ type: LOGIN, payload: { user: {}, token: null } }); // res = {user:{}, token:''}
      });
  };
}

export function login({ attributes, guestCart }) {
  return (dispatch) => {
    return Axios.post(BASE_URI + "/login", attributes)
      .then((res) => res.data)
      .then(async res => {
        await handleCart(guestCart, res);
        dispatch({ type: LOGIN, payload: res }); // res = {user:{}, token:''}
        return res;
      })
      .catch(() => {
        dispatch({ type: LOGIN, payload: { user: {}, token: null } }); // res = {user:{}, token:''}
      });
  };
}

export function register({data, guestCart}) { //{data:{fullname, email, password}, guestCart}
  return (dispatch) => {
    return Axios.post(BASE_URI + "/register", data)
      .then((res) => res.data)
      .then(async res => {
        await handleCart(guestCart, res);
        dispatch({ type: REGISTER, payload: res }); // res = {user:{}, token:''}
        return res;
      })
      .catch(() => {
        dispatch({ type: LOGIN, payload: { user: {}, token: null } }); // res = {user:{}, token:''}
      });
  };
}

export function logout(token) {
  return (dispatch) => {
    let headers = { "x-access-token": token };
    return Axios.post(BASE_URI + "/logout", {}, { headers }).then(() => {
      dispatch({ type: LOGOUT });
    })
    .catch(err => {
      dispatch({type:SET_ERROR,payload:errorsHandler(err)})
    });
  };
}

export function passwordReset(email) {
  return (dispatch) => {
    return Axios.post(BASE_URI + "/password-reset", { email }).then(() => {
      dispatch({ type: PASSWORD_RESET });
    })
    .catch(err => {
      dispatch({type:SET_ERROR,payload:errorsHandler(err)})
    });
  };
}

export function passwordChange(data) {
  return (dispatch) => {
    console.log(data);
    return Axios.put(BASE_URI + "/password-reset", data).then(() => {
      dispatch({ type: PASSWORD_RESET });
    })
    .catch(err => {
      dispatch({type:SET_ERROR,payload:errorsHandler(err)})
    });
  };
}
