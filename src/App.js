import React from 'react';
import Navbar from './components/Navbar/Navbar';
import About from './components/About/About';
import Live from './components/Live/Live';
import './App.css';

const App = () => {
  return (
    <div className="App" id="about">
      <Navbar />
      <About/>
      <Live />
    </div>
  );
}

export default App;
