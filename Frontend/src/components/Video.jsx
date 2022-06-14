import React, { useState } from 'react'
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Button } from './Button';
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
import Loader from "react-loader-spinner";
import Carousel from 'react-elastic-carousel';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import 'chart.js/auto';
import "./Video.css"
import { saveAs } from "file-saver";


export default function Video() {
    const [Video, setVideo] = useState({ preview: "", raw: "" });
    const [predictedVideo, setPredictedVideo] = useState({imgByteCode: "", maskCount: 0, noMaskCount: 0});
    const [loading, setLoading] = useState(false);
    const [errMesg, setErrMesg] = useState("");

    const resetState = () =>
    {
        setVideo({
            preview: "", raw: "" 
        })
        setPredictedVideo({imgByteCode: "", maskCount: 0, noMaskCount: 0})
        setLoading(false)
    }

    const MyUploader = () => {
        // specify upload params and url for your files
        const getUploadParams = ({ meta }) => { return { url: 'https://httpbin.org/post' } }
        
        // called every time a file's `status` changes
        const handleChangeStatus = ({ meta, file }, status) => { console.log(status, meta, file) }
        
        // receives array of files that are done uploading when submit button is clicked
        const handleSubmit = async(files, allFiles) => {
            setErrMesg("");
            setLoading(true); 
            let form_data = new FormData();
            const temp = files[0].file
            const temp_two = URL.createObjectURL(temp)
            setVideo({
                raw : temp,
                preview : temp_two
            })
            
            console.log(files)
            console.log(files[0].file)
            form_data.append('media', files[0].file);

    
            let url = 'http://localhost:5000/video_test';
        
            await axios
              .post(url, form_data, {
                headers: {
                  'content-type': 'multipart/form-data',
                  'Access-Control-Allow-Origin': '*',
                },
              })
              .then(res => {
                console.log('Response:', res)   
                console.log('data:', res.data)
                const converted = base64ToArrayBuffer(btoa(unescape(encodeURIComponent(res.data))))
                var data = new Blob([converted], {type: 'video/mp4'});
                var vidURL = URL.createObjectURL(data);
                console.log('URL:', data)
                setPredictedVideo({
                    imgByteCode: vidURL, 
                    maskCount: 50, 
                    noMaskCount: 20
                });
                setErrMesg("");
              })              
              .catch(err => {
                console.log(err)
                setErrMesg("Failed to predict");
                setLoading(false);
              });
            
              setTimeout(() => {
                setLoading(false);
              }, 3000);
          allFiles.forEach(f => f.remove())
        }
        return (
            <Dropzone
            getUploadParams={getUploadParams}
            onChangeStatus={handleChangeStatus}
            onSubmit={handleSubmit}
            maxFiles={1}
            accept="video/*"
            />
            )
        }

    const handleDownload = () =>{
        saveAs(predictedVideo.imgByteCode, 'predicted.mp4')
    }

    function base64ToArrayBuffer(base64) {
        var binaryString = window.atob(base64);
        var binaryLen = binaryString.length;
        var bytes = new Uint8Array(binaryLen);
        for (var i = 0; i < binaryLen; i++) {
           var ascii = binaryString.charCodeAt(i);
           bytes[i] = ascii;
        }
        return bytes;
     }

    return (
        <div className="Video" id="Video" style={{width: '100%', height:'min-content',minHeight:'100vh'}}>
            <div className="title">
                <h1>Video Uploader</h1>
                <h3>Upload any Videos and we will predict the mask</h3>
            </div>
            {
                (() => {
                    if (loading)
                        return <div className="container">
                                <div className="Loading-Mesg">
                            <Loader type="Rings" color="#00BFFF" height={200} width={200} />
                            Processing
                        </div>
                        </div>
                    else if (loading === false && predictedVideo.imgByteCode == false)
                    {
                        return <div className="container">
                            <div className="drop-zone">
                                <MyUploader/>
                            </div>
                        </div>
                    }
                    else if (loading === false && predictedVideo.imgByteCode)
                    {
                        return <div className="predicted-trim" >
                            <div>
                                <h1> Your file is Ready! </h1>
                                <video width="500" height="360" controls loop muted autoPlay>
                                    <source src={predictedVideo.imgByteCode.blob} type="video/mp4"/>
                                </video>
                            </div>
                            
                        <Button
                        className='btns'
                        buttonStyle='btn--outline-two'
                        buttonSize='btn--large'
                        path="#Video"
                        onClick={resetState}
                    >Reset</Button>
                    <Button
                        className='btns'
                        buttonStyle='btn--outline-two'
                        buttonSize='btn--large'
                        onClick={handleDownload}
                    >Download</Button>
                </div>
                    }
                })()
            }

            {errMesg ? (
                <div className="Err-Mesg">
                    {errMesg}
                </div>
                ) : (
                <>
                </>
            )}
            

        </div>
    )
}
