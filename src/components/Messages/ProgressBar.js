import React from "react";
import { Progress } from "semantic-ui-react";

const ProgressBar = ({ percentUploaded }) => (
  <Progress
    style={{ margin: "1em 0 0 0", padding: "0" }}
    percent={percentUploaded}
    progress
    indicating
    size="medium"
    inverted
  />
);

export default ProgressBar;
