import React, {useState,useEffect} from 'react';
import './Navbar.css';

function Navbar() {
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
                <a href="#intro" className="navbar-logo" onClick={closeMobileMenu}>
                    MASK <i class="fas fa-head-side-mask"></i>
                </a>
                <div className="menu-icon" onClick={handleClick}>
                    <i className={click ? 'fas fa-times' : 'fas fa-bars'}/> 
                </div>
                <ul className={click ? 'nav-menu active' : 'nav-menu'}>
                    <li className='nav-item'>
                        <a href='#intro' className='nav-links' onClick={closeMobileMenu}>Home</a>
                    </li>
                    <li className='nav-item'>
                        <a href='#image' className='nav-links' onClick={closeMobileMenu}>Images</a>
                    </li>
                    <li className='nav-item'>
                        <a href='#Video' className='nav-links' onClick={closeMobileMenu}>Video</a>
                    </li>
                    <li className='nav-item'>
                        <a href='#stream' className='nav-links' onClick={closeMobileMenu}>Stream</a>
                    </li>
                    
                </ul>
            </div>
        </nav>
        </>
    )
}

export default Navbar
