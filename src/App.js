import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import About from './components/About/About';
import Live from './components/Live/Live';
import { HashRouter, Route, Routes } from "react-router-dom";
import './App.css';

const App = () => {
  const [isModelLoading, setisModelLoading] = useState(false);

  const setModelLoadingOn = () => {
    setisModelLoading(true);
  };
  
  const setModelLoadingOff = () => {
    setisModelLoading(false);
  };

  return (
    <HashRouter>
      <div className="App" id="about">
        <Navbar isModelLoading={isModelLoading}/>
        <Routes>
          <Route path='/' element={<About/>}/>
          <Route path='/model' element={<Live isModelLoading={isModelLoading} setModelLoadingOn={setModelLoadingOn} setModelLoadingOff={setModelLoadingOff} />}/>
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
