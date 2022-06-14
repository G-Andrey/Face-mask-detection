# python -m flask run

from flask import Flask, json, render_template, Response, send_file, request, jsonify
from flask_cors import CORS, cross_origin
from numpy.lib.type_check import imag
from base64 import encodebytes
import torch.backends.cudnn as cudnn
import numpy as np
from PIL import Image
import flask
import torch
import pafy
import cv2 
import io
import time
import simplejpeg
from werkzeug.utils import secure_filename
import os
app = Flask(__name__)
CORS(app)

cudnn.benchmark = True

model = torch.hub.load('ultralytics/yolov5', 'custom', 'best.pt', force_reload=True)
model.conf = 0.40

url = ''
stream_on = False
total_frame = 0
stat_dict = {
    '0': 0,
    '1': 0
}

def pred_analytics(df_param):
    df = df_param
    zero_cnt, one_cnt = 0, 0
    if df.empty == False:
        s = df['class'].value_counts(dropna=False)

        try:
            zero_cnt = s[0].item()
        except:
            pass
        try:
            one_cnt = s[1].item()
        except:
            pass
        print(zero_cnt,one_cnt)
    return zero_cnt, one_cnt


def generate_frame_stream():
    # try to find a way to get 720p instead of best maybe?
    camera_source = pafy.new(url).getbest()
    capture = cv2.VideoCapture(camera_source.url)  
    
    global stat_dict
    global total_frame
    while(stream_on):
        start = time.time()
        #Capture frame-by-frame
        ret, raw_bgr_frame = capture.read()

        #convert bgr to rgb
        pred_frame_rgb = raw_bgr_frame[..., ::-1]

        pred = model(pred_frame_rgb)
        pred_frame = pred.render()[0]

        #analytics dataframe
        df = pred.pandas().xyxy[0]
        zero_count, one_count = pred_analytics((df))
        stat_dict['0'] += zero_count
        stat_dict['1'] += one_count
        total_frame += 1

        # only predicted frame
        frame_bytes = simplejpeg.encode_jpeg(pred_frame)
        
        yield(b'--frame\r\n'b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

        # # original and predicted frames side by side horizontally
        # combined_frame = np.concatenate((raw_rgb_frame, pred_frame), axis=1)
        # combined_frame_bytes = cv2.imencode('.jpg', combined_frame)[1].tobytes()
        # yield(b'--frame\r\n'b'Content-Type: image/jpeg\r\n\r\n' + combined_frame_bytes + b'\r\n')

        stop = time.time()
        print("Frame process time: ", stop - start)
    print('exiting loop')    
    
@app.route('/video_feed',methods=['GET'])
def video_feed():
    """
    Video streaming route. Put this in the src attribute of an img tag.
    URL argument must be included in query parameters
    ie: http://127.0.0.1:5000/video_feed?url={some_youtube_link}
    """
    global url
    global stream_on

    stream_on = True
    url = request.args.get("url")
    
    return Response(generate_frame_stream(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/analytics',methods=['GET'])
def send_analytics():
    res = {
        'Mask': stat_dict['0'],
        'No Mask': stat_dict['1'],
        'Total Frame': total_frame
        }

    return jsonify(res)

@app.route('/stop_feed',methods=['POST'])
@cross_origin()
def stop_feed():
    global total_frame
    global stat_dict
    global stream_on
    stream_on = False
    stat_dict = {
    '0': 0,
    '1': 0
    }
    total_frame = 0
    return Response('Stopped')


@app.route('/video_test',methods=['POST'])
@cross_origin()
def pred_vid():
    f = request.files['media']
    print(type(f))
    basepath = os.path.dirname(__file__)
    file_path = os.path.join(
        basepath, secure_filename(f.filename))
    f.save(file_path)
    print(f.filename)
    capture = cv2.VideoCapture(f.filename)
    frame_width = int(capture.get(3))
    frame_height = int(capture.get(4))
    save_name = f.filename.split('.')[0]+'_out.mp4'
    out = cv2.VideoWriter(save_name, cv2.VideoWriter_fourcc(*'MP4V'), 30, (frame_width,frame_height),)

    ret, current_frame = capture.read()
    while (ret):

        current_frame = current_frame[..., ::-1]

        pred = model(current_frame)
        pred_frame = pred.render()[0]

        pred_frame = pred_frame[..., ::-1]
        out.write(pred_frame)

        ret, current_frame = capture.read()

    # print(save_name)
    # print(file_path)
    response = send_file(save_name, mimetype='video/mp4', as_attachment=True)

    # @flask.after_this_request
    # def close_action(response):
    #     @response.call_on_close
    #     def delete():
    #         try:
    #             os.remove(file_path)
    #         except:
    #             print(file_path)
    #         try:
    #             os.remove(save_name)
    #         except Exception as e:
    #             print(e)

    return response
    # try:
    #     os.remove(file_path)
    # except:
    #     print(file_path)
    # try:
    #     os.remove(save_name)
    # except:
    #     print(save_name)
    #return res


@app.route('/predict_img',methods=['POST'])
@cross_origin()
def predict_img():
    """
    Takes in a image, predicts on it, and sends the predicted image back.
    Request format: 
        image: image.png
    """
    start = time.time()
    # Getting the image
    imagefile_bytes = request.files['image'].read()
    print("image successfully uploaded")

    img_numpy_bgr = cv2.imdecode(np.frombuffer(imagefile_bytes, np.uint8), cv2.IMREAD_COLOR)
    img_numpy_rgb = cv2.cvtColor(img_numpy_bgr , cv2.COLOR_BGR2RGB)
    
    pred = model(img_numpy_rgb)
    pred_numpy_img= pred.render()[0]

    # Converts np array of image pixels to png bytecode
    pred_img = Image.fromarray(pred_numpy_img)
    imageio = io.BytesIO()
    pred_img.save(imageio, "PNG", quality=100)
    imageio.seek(0)
    encoded_img = encodebytes(imageio.getvalue()).decode('ascii')

    pred_counts = pred_analytics(pred.pandas().xyxy[0])

    # print("mask counts: ",pred_counts[0], "\nno mask counts: ", pred_counts[1])

    res = {
        'predImage': encoded_img,
        'maskCount': pred_counts[0],
        'noMaskCount': pred_counts[1]
    }
    
    return jsonify(res)

if __name__ == "__main__":
    app.run(debug=True, threaded = True)