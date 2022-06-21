import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import labels from "./labels.json";
import "./Live.css";

tf.enableProdMode();

const Live = (props) => {
  const [model, setModel] = useState(null);
  const [webcam, setWebcam] = useState("close");
  const [image, setImage] = useState("close");
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [loading, setLoading] = useState({ state: "loading", progress: 0 });
  const [aniId, setAniId] = useState(null);
  const threshold= 0.25;
  const inputImage = useRef(null);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imgcanvasRef = useRef(null);

  const openWebcam = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "environment",
          },
        })
        .then((stream) => {
          window.localStream = stream;
          videoRef.current.srcObject = stream;
          setWebcam("open");
          videoRef.current.onloadedmetadata = () => {
            detectFrame();
          };
        });
    } else alert("Can't open Webcam!");
  };

  const closeWebcam = () => {
    if (videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
      window.localStream.getTracks().forEach((track) => {
        track.stop();
      });
      setWebcam("close");
    } else alert("Please open Webcam first!");
  };

  const closeImage = () => {
    if (imageRef.current.src) {
      imageRef.current.src = null;
      setImage("close");
    } else alert("No Image to close");
  }

  const renderPrediction = (boxes_data, scores_data, classes_data) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clean canvas

    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";

    for (let i = 0; i < scores_data.length; ++i) {
      if (scores_data[i] > threshold) {
        const klass = labels[classes_data[i]];
        const score = (scores_data[i] * 100).toFixed(1);

        let [x1, y1, x2, y2] = boxes_data.slice(i * 4, (i + 1) * 4);
        x1 *= canvasRef.current.width;
        x2 *= canvasRef.current.width;
        y1 *= canvasRef.current.height;
        y2 *= canvasRef.current.height;
        const width = x2 - x1;
        const height = y2 - y1;
        const color = (klass == 'no_mask') ? "#fc031c" : "#03fc0b";

        // Draw the bounding box.
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x1, y1, width, height);

        // Draw the label background.
        ctx.fillStyle = color;
        const textWidth = ctx.measureText(klass + " - " + score + "%").width;
        const textHeight = parseInt(font, 10); // base 10
        ctx.fillRect(x1 - 1, y1 - (textHeight + 2), textWidth + 2, textHeight + 2);

        // Draw labels
        ctx.fillStyle = "#ffffff";
        ctx.fillText(klass + " - " + score + "%", x1 - 1, y1 - (textHeight + 2));
      }
    }
  };

  const renderPredictionImage = (boxes_data, scores_data, classes_data) => {
    const ctx = imgcanvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clean canvas

    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";

    for (let i = 0; i < scores_data.length; ++i) {
      if (scores_data[i] > threshold) {
        const klass = labels[classes_data[i]];
        const score = (scores_data[i] * 100).toFixed(1);

        let [x1, y1, x2, y2] = boxes_data.slice(i * 4, (i + 1) * 4);
        x1 *= imgcanvasRef.current.width;
        x2 *= imgcanvasRef.current.width;
        y1 *= imgcanvasRef.current.height;
        y2 *= imgcanvasRef.current.height;
        const width = x2 - x1;
        const height = y2 - y1;
        const color = (klass == 'no_mask') ? "#fc031c" : "#03fc0b";

        // Draw the bounding box.
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x1, y1, width, height);

        // Draw the label background.
        ctx.fillStyle = color;
        const textWidth = ctx.measureText(klass + " - " + score + "%").width;
        const textHeight = parseInt(font, 10); // base 10
        ctx.fillRect(x1 - 1, y1 - (textHeight + 2), textWidth + 2, textHeight + 2);

        // Draw labels
        ctx.fillStyle = "#ffffff";
        ctx.fillText(klass + " - " + score + "%", x1 - 1, y1 - (textHeight + 2));
      }
    }
  };

  const detectFrame = async () => {
    if (videoRef.current.srcObject) {
      tf.engine().startScope();
      let [modelWidth, modelHeight] = model.inputs[0].shape.slice(1, 3);
      const input = tf.tidy(() => {
        return tf.image
          .resizeBilinear(tf.browser.fromPixels(videoRef.current), [modelWidth, modelHeight])
          .div(255.0)
          .expandDims(0);
      });

      await model.executeAsync(input).then((res) => {
        const [boxes, scores, classes] = res.slice(0, 3);
        const boxes_data = boxes.dataSync();
        const scores_data = scores.dataSync();
        const classes_data = classes.dataSync();
        renderPrediction(boxes_data, scores_data, classes_data);
        tf.dispose(res);
      });

      const reqId = requestAnimationFrame(detectFrame);
      setAniId(reqId);
      tf.engine().endScope();
    }
  };

  const detectImage = async () => {
    tf.engine().startScope();
    let [modelWidth, modelHeight] = model.inputs[0].shape.slice(1, 3);
    const input = tf.tidy(() => {
      return tf.image
        .resizeBilinear(tf.browser.fromPixels(imageRef.current), [modelWidth, modelHeight])
        .div(255.0)
        .expandDims(0);
    });

    await model.executeAsync(input).then((res) => {
      const [boxes, scores, classes] = res.slice(0, 3);
      const boxes_data = boxes.dataSync();
      const scores_data = scores.dataSync();
      const classes_data = classes.dataSync();
      
      renderPredictionImage(boxes_data, scores_data, classes_data);
      tf.dispose(res);
    });
    tf.engine().endScope();
  };

  useEffect(() => {
    props.setModelLoadingOn();
    setLoading({ state: "loading", progress: 0 });
    tf.loadGraphModel(`face-mask-model_web_model/model.json`, {
      onProgress: (fractions) => {
        setLoading({ state: "loading", progress: fractions });
      },
    }).then(async (yolov5) => {
      // Warmup the model before using real data.
      const dummyInput = tf.ones(yolov5.inputs[0].shape);
      await yolov5.executeAsync(dummyInput).then((warmupResult) => {
        tf.dispose(warmupResult);
        tf.dispose(dummyInput);

        setModel(yolov5);
        props.setModelLoadingOff();
        setLoading({ state: "ready", progress: 1 });
        console.log("model loaded")
      });
    });
  }, []);

  return (
    <>
    <div className="Live" style={props.isModelLoading ? {marginTop:'40px'} : {marginTop:'20px'}}>
      <div className='title' id='live'>
        Webcam
      </div>
      <ul className="webcam-ul">
        <li>
          Test the model with your device's webcam
        </li>
      </ul>
      <div className="content">
        <div className="main" >
          <video
            style={{ display: webcam === "open" ? "block" : "none" }}
            autoPlay
            playsInline
            muted
            ref={videoRef}
            className="main-video"
          />
          <canvas
            width={640}
            height={360}
            style={{
              display: webcam === "open" ? "block" : "none",
            }}
            ref={canvasRef}
            className="main-canvas"
          />
          <img
            width={360}
            height={360}
            className="temp-img"
            style={{
              display: webcam === "open" ? "none" : "block",
            }}
            src='temp-webcam-img.jpg'
          />
        </div>
        <div className="btnWrapper">
          <button
            className={webcam === "open" ? "active" : "nonActive"}
            onClick={() => {
              if (webcam === "close") {
                openWebcam();
              } else {
                cancelAnimationFrame(aniId);
                setAniId(null);
                closeWebcam();
              }
            }}
            disabled={loading.state === "ready" ? false : true}
          >
            {webcam === "open" ? "Close" : "Activate"} Webcam
          </button>
        </div>
      </div>
    </div>
    <div className="image-container" id="image">
      <div className='title'>
        Image
      </div>
      <ul className="webcam-ul">
        <li>
          Test the model out on an image from your system
        </li>
        <li>
          <em>Webcam must be closed when predicting on an image</em>
        </li>
      </ul>
      <div className='content'>
          <img
            style={{ display: image === "open" ? "block" : "none" }}
            ref={imageRef}
            className="main-img"
          />
          <canvas
            style={{
              display: image === "open" ? "block" : "none",
            }}
            width={canvasWidth}
            height={canvasHeight}
            ref={imgcanvasRef}
            className="main-canvas-img"
          />
          <img
            width={360}
            height={360}
            className="temp-img"
            style={{
              display: image === "open" ? "none" : "block",
            }}
            src='temp-picture-img.jpg'
          />
          <div className="btnWrapper">
            <input
              type="file"
              ref={inputImage}
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                console.log('image opened')
                if (e.target.files[0] !== null && e.target.files.length !== 0) {
                  const f = e.target.files[0];
                  const src = window.URL.createObjectURL(f);
                  imageRef.current.src = src;
                  setImage("open");
                  imageRef.current.onload = () => {
                    setCanvasWidth(imageRef.current.width);
                    setCanvasHeight(imageRef.current.height);
                    detectImage();
                    window.URL.revokeObjectURL(src);
                  };
                }
              }}
            />
            <button
              className="nonActive"
              disabled={loading.state === "ready" ? false : true}
              onClick={() => {
                if (webcam === "open"){
                  closeWebcam()
                }
                inputImage.current.click();
              }}
            >
              {image === "open" ? "New" : "Upload"} Image
            </button>
            {
              image === "open" ?
              <button
                className="closeImage"
                onClick={
                  () => {
                    closeImage()
                  }
                }
              >
                Close Image
              </button>
              :
              null
            }
          </div>
      </div>
    </div>
    <div className='rest'>
    </div>
    </>
);

};

export default Live;