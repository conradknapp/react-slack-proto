import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

let config = {
  apiKey: "AIzaSyCjK4q_oD7jJF3l2uw1I12LqiAbMMuqKGI",
  authDomain: "react-slack-dev.firebaseapp.com",
  databaseURL: "https://react-slack-dev.firebaseio.com",
  projectId: "react-slack-dev",
  storageBucket: "react-slack-dev.appspot.com",
  messagingSenderId: "989315302223"
};
firebase.initializeApp(config);

export default firebase;
