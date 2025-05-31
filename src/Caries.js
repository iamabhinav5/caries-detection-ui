import React, {useRef, useState} from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  useMediaQuery,
  useTheme,
  Snackbar,
  Fade,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  makeStyles,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import axios from "axios";
import Webcam from "react-webcam";

const useStyles = makeStyles((theme) => ({
  removeIconButton: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
    backgroundColor: "rgba(0,0,0,0.4)",
    color: "#fff",
    zIndex: 20,
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.7)",
    },
  },
  imageWrapper: {
    position: "relative",
    borderRadius: 12,

    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
    maxWidth: 640,
    margin: "auto",
    userSelect: "none",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(3),
    marginBottom: theme.spacing(5),
  },
  detectButton: {
    minWidth: 140,
    fontWeight: 700,
    textTransform: "none",
    borderRadius: 8,
    boxShadow: "0 6px 18px rgba(198, 40, 40, 0.5)",
    backgroundColor: "#d32f2f",
    color: "#fff",
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "#b71c1c",
    },
    [theme.breakpoints.down("xs")]: {
      minWidth: "100%",
    },
  },
  uploadButton: {
    fontWeight: 700,
    textTransform: "none",
    boxShadow: "0 5px 15px rgba(25, 118, 210, 0.4)",
    borderRadius: 8,
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "#115293",
    },
  },
  cameraButton: {
    fontWeight: 700,
    textTransform: "none",
    backgroundColor: "#00796b",
    color: "#fff",
    boxShadow: "0 5px 15px rgba(0, 121, 107, 0.45)",
    borderRadius: 8,
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "#004d40",
    },
  },
  cardRoot: {
    width: "100%",
    maxWidth: 720,
    borderRadius: 12,
    padding: theme.spacing(5, 6),
    boxShadow:
      "0 16px 40px rgba(33, 150, 243, 0.3), 0 8px 20px rgba(0,0,0,0.12)",
    backgroundColor: "#ffffffdd",
    backdropFilter: "blur(14px)",
    userSelect: "none",
    position: "relative",
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(3, 3),
    },
  },
}));

const CariesDetection = () => {
  const classes = useStyles();
  const [imageSrc, setImageSrc] = useState(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // State for Camera Dialog
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const webcamRef = useRef(null);

  const imageRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setDetections([]);
    };
    reader.readAsDataURL(file);
  };

  const detectCaries = async () => {
    if (!imageSrc) return;

    setLoading(true);
    setErrorMsg("");
    setSnackbarOpen(false);

    const base64Image = imageSrc.split(",")[1];

    try {
      const response = await axios({
        method: "POST",
        url: "https://serverless.roboflow.com/deteksi-dini-karies-icdas/5",
        params: {api_key: "LeASolcoE8baN89cUj3y"},
        data: base64Image,
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
      });

      setDetections(response.data.predictions || []);
      if (response?.data?.predictions.length < 1) {
        setErrorMsg("No caries found, please upload another image.");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("API Error:", error.message);
      setErrorMsg("Error detecting caries, please try again.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = (capture = false) => {
    if (loading) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    if (capture) input.capture = "environment";
    input.onchange = handleFileChange;
    input.click();
  };

  const removeImage = () => {
    if (loading) return;
    setImageSrc(null);
    setDetections([]);
    setErrorMsg("");
    setSnackbarOpen(false);
  };

  const renderBoxes = () => {
    if (!imageRef.current || detections.length === 0) return null;

    const img = imageRef.current;
    const scaleX = img.clientWidth / img.naturalWidth;
    const scaleY = img.clientHeight / img.naturalHeight;

    return detections.map((det, idx) => (
      <Box
        key={idx}
        style={{
          position: "absolute",
          left: `${(det.x - det.width / 2) * scaleX}px`,
          top: `${(det.y - det.height / 2) * scaleY}px`,
          width: `${det.width * scaleX}px`,
          height: `${det.height * scaleY}px`,
          border: "2px solid #1565c0",
          borderRadius: 6,
          boxSizing: "border-box",
          pointerEvents: "none",
          backgroundColor: "rgba(21, 101, 192, 0.15)",
          transition: "all 0.25s ease",
          zIndex: 10,
        }}
      >
        <Typography
          variant="caption"
          style={{
            backgroundColor: "#0d47a1",
            color: "white",
            fontSize: 11,
            position: "absolute",
            top: -22,
            left: 0,
            padding: "4px 8px",
            borderRadius: 6,
            fontWeight: 700,
            userSelect: "none",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          }}
        >
          {det.class} ({(det.confidence * 100).toFixed(1)}%)
        </Typography>
      </Box>
    ));
  };

  // Camera dialog handlers
  const openCameraDialog = () => {
    if (loading) return;
    setCapturedPhoto(null);
    setCameraOpen(true);
  };

  const handleCapture = () => {
    if (webcamRef.current) {
      const photo = webcamRef.current.getScreenshot();
      setCapturedPhoto(photo);
    }
  };

  const handleAccept = () => {
    setImageSrc(capturedPhoto);
    setDetections([]);
    setCameraOpen(false);
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  const handleCloseDialog = () => {
    setCameraOpen(false);
    setCapturedPhoto(null);
  };

  return (
    <Box
      minHeight="100vh"
      py={6}
      px={3}
      style={{
        background:
          "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 60%, #a1c4fd 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
      }}
    >
      <Card elevation={12} className={classes.cardRoot}>
        <CardContent>
          <Typography
            variant={isMobile ? "h5" : "h3"}
            gutterBottom
            style={{
              fontWeight: 800,
              color: "#0d47a1",
              textAlign: "center",
              letterSpacing: "0.04em",
              marginBottom: theme.spacing(3),
              userSelect: "text",
            }}
          >
            Dental Caries Detection
          </Typography>

          <Typography
            variant={isMobile ? "body2" : "body1"}
            color="textSecondary"
            align="center"
            style={{
              marginBottom: theme.spacing(5),
              userSelect: "text",
              maxWidth: 560,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Upload an image or take a photo of teeth to detect cavities using AI
            technology.
          </Typography>

          <Box className={classes.buttonGroup}>
            <Button
              variant="contained"
              color="primary"
              size={isMobile ? "medium" : "large"}
              onClick={() => triggerFileInput(false)}
              aria-label="Upload image from storage"
              disabled={loading}
              className={classes.uploadButton}
              style={{minWidth: isMobile ? "100%" : 180}}
            >
              Upload from Storage
            </Button>

            <Button
              variant="contained"
              size={isMobile ? "medium" : "large"}
              onClick={openCameraDialog}
              aria-label="Take photo using camera"
              disabled={loading}
              className={classes.cameraButton}
              style={{minWidth: isMobile ? "100%" : 140}}
            >
              Take Photo
            </Button>

            {imageSrc && (
              <Button
                variant="contained"
                onClick={detectCaries}
                disabled={loading}
                aria-label="Detect caries"
                className={classes.detectButton}
                size={isMobile ? "medium" : "large"}
              >
                {loading ? (
                  <>
                    Detecting...
                    <CircularProgress
                      size={24}
                      thickness={5}
                      color="inherit"
                      style={{marginLeft: 12}}
                      aria-label="Loading detection results"
                    />
                  </>
                ) : (
                  "Detect"
                )}
              </Button>
            )}
          </Box>

          {imageSrc && (
            <Box
              className={classes.imageWrapper}
              mb={4}
              position="relative"
              aria-live="polite"
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Selected teeth for caries detection"
                style={{
                  width: "100%",
                  borderRadius: 12,
                  display: "block",
                  userSelect: "none",
                }}
                draggable={false}
              />
              {renderBoxes()}

              <IconButton
                aria-label="Remove image"
                onClick={removeImage}
                className={classes.removeIconButton}
                size="small"
                title="Remove selected image"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}

          {!imageSrc && (
            <Typography
              variant="body2"
              align="center"
              color="textSecondary"
              style={{userSelect: "none"}}
            >
              No image selected. Upload or take a photo to get started.
            </Typography>
          )}

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
            message={errorMsg}
            anchorOrigin={{vertical: "top", horizontal: "center"}}
            TransitionComponent={Fade}
            action={
              <IconButton
                size="small"
                aria-label="Close error message"
                color="inherit"
                onClick={() => setSnackbarOpen(false)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          />
        </CardContent>
      </Card>

      {/* Camera Dialog */}
      <Dialog
        open={cameraOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Take a Photo</DialogTitle>
        <DialogContent dividers style={{textAlign: "center"}}>
          {capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Captured preview"
              style={{width: "100%", borderRadius: 8}}
            />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: "environment",
              }}
              style={{width: "100%", borderRadius: 8}}
            />
          )}
        </DialogContent>
        <DialogActions>
          {capturedPhoto ? (
            <>
              <Button onClick={handleRetake} color="primary">
                Retake
              </Button>
              <Button onClick={handleAccept} color="primary">
                Accept
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleCloseDialog} color="primary">
                Cancel
              </Button>
              <Button onClick={handleCapture} color="primary">
                Capture
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CariesDetection;
