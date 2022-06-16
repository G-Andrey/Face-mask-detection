import React, {useState,useEffect} from 'react';
import './Navbar.css';

const Navbar = () => {
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
                    <a href="/" className="navbar-logo" onClick={closeMobileMenu}>
                        <i className="fas fa-head-side-mask"></i>
                    </a>
                    <div className="menu-icon" onClick={handleClick}>
                        <i className={click ? 'fas fa-times' : 'fas fa-bars'}/> 
                    </div>
                    <ul className={click ? 'nav-menu active' : 'nav-menu'}>
                        <li className='nav-item'>
                            <a href='#about' className='nav-links' onClick={closeMobileMenu}>About</a>
                        </li>
                        <li className='nav-item'>
                            <a href='#live' className='nav-links' onClick={closeMobileMenu}>Live</a>
                        </li>
                        <li className='nav-item'>
                            <a href='#image' className='nav-links' onClick={closeMobileMenu}>Image</a>
                        </li>    
                    </ul>
                </div>
            </nav>
        </>
    )
}

export default Navbar
