import './About.css'

const About = () => {
  return (
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
          The model was trained on the YoloV5 architecture using transfer learning from the YoloV5s model. 
          The YoloV5s model was chosen as it strikes a good balance between size and predictive precision
        </li>
        <li>

        </li>
      </ul>
      <img />
    </div>
  );
};

export default About;