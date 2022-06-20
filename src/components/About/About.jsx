import './About.css'
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div style={{height:'100vh', backgroundColor:'#2d3748'}}>
    <div className="hero-container">
      <video src='/videos/video-2.mp4' autoPlay loop muted className='hero-video'/>
    </div>
    <div className="about-container" >
      <div className="title">
        About the Model
      </div>
      <ul className="body">
        <li>
          This computer vision model was trained to detect and classify whether a human is wearing a mask or not with bounding box annotations
        </li>
        <li> 
          As such, the model contains two classes: mask and no_mask. 
          Each prediction is displayed with it's corresponding confidence threshold [25%-100%]  
        </li>
        <li>
          Trained on the YoloV5 architecture using transfer learning from the YoloV5s model
        </li>
        <li>
          Trained via Google Colab using a P100 GPU taking 3.5 hours
        </li>
        <li>
          Trained on over 2,700 images containing over 3,000 annotations
        </li>
        <li>
          Model was tested on 680 validation images that were withheld from the training set
        </li>
        <li>
          Achieved 88% precision and 89% recall when tested on the validation images
        </li>
      </ul>
      <div className='about-btn-container'>
        <Link to="/model">
          <button className="about-btn">
            Test the model
          </button>          
        </Link>
      </div>
    </div>
    </div>
  );
};

export default About;