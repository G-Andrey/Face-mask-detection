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
          Trained on the YoloV5 architecture using transfer learning from the YoloV5s model. 
          The YoloV5s model was chosen as it strikes a good balance between size and predictive precision
        </li>
        <li>
          Trained via Google Colab using a P100 GPU, taking 3.5 hours
        </li>
        <li>
          Trained on over 2,700 images containing over 4,000 annoations
        </li>
        <li>
          Model was tested on 680 validation images that were withheld from the training set
        </li>
        <li>
          Achieved 88% precision and 89% recall when tested on the validation images
        </li>
      </ul>
      <img />
    </div>
  );
};

export default About;