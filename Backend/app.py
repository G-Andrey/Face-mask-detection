# python -m flask run

from flask import Flask, json, render_template, Response, send_file, request, jsonify
from flask_cors import CORS, cross_origin
from numpy.lib.type_check import imag
from base64 import encodebytes
import torch.backends.cudnn as cudnn
import numpy as np
from PIL import Image
import torch
import cv2 
import io
from werkzeug.utils import secure_filename
import os
app = Flask(__name__)
CORS(app)

cudnn.benchmark = True

model = torch.hub.load('ultralytics/yolov5', 'custom', 'best.pt', force_reload=True)
model.conf = 0.40

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