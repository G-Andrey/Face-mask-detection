import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Image from './components/Image';
import Video from './components/Video';
import Stream from './components/Stream';
import './App.css';


function App() {
  return (
    <div className="app">
      <Navbar/>
      <div className="sections">
        <HeroSection/>
        <Image/>
        <Video/>
        <Stream/>
        
      </div>
    </div>
  );
}

export default App;
