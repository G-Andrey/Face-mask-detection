import React, { useState } from 'react'
import './Stream.css'
import  axios from 'axios'
export default function Stream() {

    const [url, setUrl] = useState("");
    const [showStream, setShowStream] = useState(false)

    const handleUrlChange = (e) => {
        setUrl(e.target.value);
        console.log(url)
    };
    
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            console.log('http://127.0.0.1:5000/video_feed?url='+url);
            setShowStream(true);
        }
    }

    const handleClick = (event) =>
    {
        console.log('http://127.0.0.1:5000/video_feed?url='+url);
        setShowStream(true);
    }

    const handleStopbutton = (e) =>{
        axios.post('http://127.0.0.1:5000/stop_feed').then(res => console.log(res.data))
        console.log('pressed')
        setShowStream(false);
    }

    const handleTest = (e) =>{
        axios.get('http://127.0.0.1:5000/analytics').then(res => console.log(res.data))
        console.log('pressed')
    }   

    return (
        <>
            <div className="stream" id="stream">
                <div className="title">
                    <h1>Stream Uploader</h1>
                    <h3>Input any youtube stream</h3>
                </div>
                <div className="container"> 
                    {/* <button class='stop' onClick={handleStopbutton}>Stop</button> */}
                    {showStream ? 
                    ( <div className="video-player">
                        <img src={'http://127.0.0.1:5000/video_feed?url='+url}  width="600" height="360"/>
                        <div className="button_local">
                            <button class='stop' onClick={handleStopbutton}>Stop</button>
                        </div>
                    </div>
                    ) 
                    : 
                    (<form className="input-field">
                    <input className="field-text" 
                            type="text" value={url} 
                            onChange={handleUrlChange} 
                            id="youtube-url-field" 
                            onKeyDown={handleKeyDown}
                            placeholder="Enter your youtube stream URL here"/>
                    <button onClick={handleClick}>Submit</button>
                </form>)
                }
                </div>
            </div>
        </>
    )
}
