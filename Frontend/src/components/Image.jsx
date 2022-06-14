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
import "./Image.css"

export default function Image() {
    const [image, setImage] = useState({ preview: "", raw: "" });
    const [predictedImage, setPredictedImage] = useState({imgByteCode: "", maskCount: 0, noMaskCount: 0});
    const [loading, setLoading] = useState(false);
    const [errMesg, setErrMesg] = useState("");

    const resetState = () =>
    {
        setImage({
            preview: "", raw: "" 
        })
        setPredictedImage({imgByteCode: "", maskCount: 0, noMaskCount: 0})
        setLoading(false)
    }

    const MyUploader = () => {
        // specify upload params and url for your files
        const getUploadParams = ({ meta }) => { return { url: 'https://httpbin.org/post' } }
        
        // called every time a file's `status` changes
        const handleChangeStatus = ({ meta, file }, status) => { console.log(status, meta, file) }
        
        // receives array of files that are done uploading when submit button is clicked
        const handleSubmit = (files, allFiles) => {
            setErrMesg("");
            setLoading(true); 
            let form_data = new FormData();
            const temp = files[0].file
            const temp_two = URL.createObjectURL(temp)
            setImage({
                raw : temp,
                preview : temp_two
            })
            
            form_data.append('image', files[0].file);

    
            let url = 'http://localhost:5000/predict_img';
        
            axios
              .post(url, form_data, {
                headers: {
                  'content-type': 'multipart/form-data',
                  'Access-Control-Allow-Origin': '*',
                },
              })
              .then(res => {
                setPredictedImage({
                    imgByteCode: res.data.predImage, 
                    maskCount: res.data.maskCount, 
                    noMaskCount: res.data.noMaskCount
                });
                setErrMesg("");
              })              
              .catch(err => {
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
            accept="image/*"
            />
            )
        }

    return (
        <div className="image" id="image" style={{width: '100%', height:'min-content',minHeight:'100vh'}}>
            <div className="title">
                <h1>Image Uploader</h1>
                <h3>Upload any images and we will predict the mask</h3>
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
                    else if (loading === false && predictedImage.imgByteCode == false)
                    {
                        return <div className="container">
                            <div className="drop-zone">
                                <MyUploader/>
                            </div>
                        </div>
                    }
                    else if (loading === false && predictedImage.imgByteCode)
                    {
                        return <div className="predicted-trim" >
                            <Carousel>
                            <div>
                                <h1> Original </h1>
                                <img src={image.preview} alt="dummy" width="800" height="400" />
                            </div>
                            <div>
                                <h1> Prediction </h1>
                                <img src={`data:image/jpeg;base64,${predictedImage.imgByteCode}`} alt="dummy" className="pred-img" width="800" height="400"/>
                            </div>
                            <div>
                                <h1>Bar Graph</h1>
                            <Bar
                            data={{
                                labels:['Count'], 
                                datasets:[
                                    {
                                        label: 'Mask',
                                        data: [predictedImage.maskCount,],
                                        backgroundColor: [
                                            'rgba(0, 255, 0, .3)',
                                        ],
                                        borderColor:[
                                            'rgba(0, 255, 0, 1)',
                                        ],
                                        borderWidth:1,
                                    },
                                    {
                                        label: 'No Mask',
                                        data: [predictedImage.noMaskCount],
                                        backgroundColor: [
                                            'rgba(255, 0, 0, .3)',
                                        ],
                                        borderColor:[
                                            'rgba(255, 0, 0, 1)',
                                        ],
                                        borderWidth:1,
                                    },
                                ],
                            }}
                            height={400}
                            width={800}
                            options={{
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            stepSize: 1
                                        }
                                    },
                                },
                            }}
                        />

                            </div>
                        </Carousel>
                        <Button
                        className='btns'
                        buttonStyle='btn--outline-two'
                        buttonSize='btn--large'
                        path="#image"
                        onClick={resetState}
                    >Reset</Button>
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
