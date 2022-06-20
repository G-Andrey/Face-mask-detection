import React, {useState,useEffect} from 'react';
import { Link } from "react-router-dom";
import './Navbar.css';

const Navbar = (props) => {
    const [click,setClick] = useState(false);
    const [button,setButton] = useState(true);
    
    const handleClick = () => setClick(!click);
    const closeMobileMenu = () => setClick(false);
    const showButton = () => 
    {
        if(window.innerWidth <= 960)
        {
            setButton(false)
        }
        else{
            setButton(true)
        }
    }

    useEffect(() => {
        showButton();
    },[]);

    window.addEventListener('resize',showButton)

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                        <i className="fas fa-head-side-mask"></i>
                    </Link>
                    <div className="menu-icon" onClick={handleClick}>
                        <i className={click ? 'fas fa-times' : 'fas fa-bars'}/> 
                    </div>
                    <ul className={click ? 'nav-menu active' : 'nav-menu'}>
                        <li className='nav-item'>
                            <Link to='/' className='nav-links' onClick={closeMobileMenu}>About</Link>
                        </li>
                        <li className='nav-item'>
                            <Link to='/model#' className='nav-links' onClick={closeMobileMenu}>Live</Link>
                        </li>
                        <li className='nav-item'>
                            <Link to='/model#image' className='nav-links' onClick={closeMobileMenu}>Image</Link>
                        </li>    
                    </ul>
                </div>
                {
                    props.isModelLoading ?
                    <div className="loader-container" >
                        <p>Loading model</p>
                    </div>
                    :
                    null
                }
            </nav>
        </>
    )
}

export default Navbar
