# *Face Mask Detection* using yolov5

## About the Project
The main objective of this project is to develop a machine learning model that uses computer vision to detect whether a person is wearing a mask or not. The model predicts on both images and live streaming. Our final trained model is capable of predicting on video frames in around 35 milliseconds allowing for nearly 30 predicted frames per seconds all with impressive accuracy.

## Video Walthrough
Here's walthrough of fully functional model:

<img src='https://github.com/darkhunter3210/Face-Mask/blob/master/Walkthrough.gif' title='Video Walkthrough' width='' alt='Video Walkthrough' />



### Run Frontend
1. `cd Frontend/`
2. `yarn install`
3. `yarn start`

### Run Backend
:warning: In order for the backend to run smoothly, [PyTorch](https://pytorch.org/get-started/locally/) must be installed with CUDA to utilize GPU for model predictions. If not, predictions will take 4-5x longer resulting in a lagging stream. :warning:
1. `cd Backend/`
2. `python -m flask run`

