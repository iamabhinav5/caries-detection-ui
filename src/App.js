import React, {useState} from "react";
import CariesDetection from "./Caries";
import {
  TextField,
  Button,
  Typography,
  Paper,
  makeStyles,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    backgroundColor: "#f3f6f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    padding: theme.spacing(4),
    borderRadius: theme.spacing(1.5),
    maxWidth: 400,
    width: "100%",
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  input: {
    marginBottom: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(1),
  },
  error: {
    color: theme.palette.error.main,
    marginTop: theme.spacing(1),
  },
}));

const ACCESS_CODE = "Cario@123Ai"; // change as needed

function App() {
  const classes = useStyles();
  const [enteredCode, setEnteredCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (enteredCode === ACCESS_CODE) {
      setIsAuthorized(true);
      setError("");
    } else {
      setError("Invalid access code. Please try again.");
    }
  };

  if (isAuthorized) {
    return <CariesDetection />;
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Typography variant="h5" gutterBottom>
          Enter Access Code
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            type="password"
            label="Access Code"
            variant="outlined"
            fullWidth
            value={enteredCode}
            onChange={(e) => setEnteredCode(e.target.value)}
            className={classes.input}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            className={classes.button}
          >
            Submit
          </Button>
          {error && <Typography className={classes.error}>{error}</Typography>}
        </form>
      </Paper>
    </div>
  );
}

export default App;
