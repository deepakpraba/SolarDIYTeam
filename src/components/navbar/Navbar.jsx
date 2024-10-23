import React from 'react'
import './navbar.css';
import {RiMenu3Line,RiCloseLine} from 'react-icons/ri';
import {useEffect, useState} from 'react';
import SolarLogoT2 from '../../Assets/SolarLogoT2.png'

const Menu = () => (
  <>
          <p><a href='#home'>Home</a></p>
          <p><a href='#features'>What is Solar?</a></p>
          <p><a href='#whatSolar'>DIY Solar</a></p>
          <p><a href='#features'>Case Studies</a></p>
          <p><a href='#blog'>Resources</a></p>
  </>
)

function Navbar() {
  const [toggleMenu, setToggleMenu] = useState(false);

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth > 600) {
                setToggleMenu(false);
            }
        }

        window.addEventListener('resize', handleResize);

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
  
  return (
    <div className = "solar__navbar">
      <div className = "solar__navbar-links">
        <div className = "solar__navbar-links_logo">
           <img src = {SolarLogoT2} alt = "logo" /> 
        </div>
        <div className='solar__navbar-links_container'>
          <Menu />
        </div>

        <div className='solar__navbar-sign'>
          <button type='button'> Sign In </button> 
          <button type='button'> Sign Up </button>
        </div>

        <div className='solar__navbar-menu'> 
            {toggleMenu
            ?<RiCloseLine color ="#fff" size={27} onClick={() => setToggleMenu(false)}/>
            :<RiMenu3Line color ="#fff" size={27} onClick={() =>  setToggleMenu(true)}/>

            }
            { toggleMenu &&(
              <div className='solar__navbar-menu_container scale-up-center'>
                <div className='solar__navbar-menu_container-links'>
                  <Menu/>
                  <div className='solar__navbar-menu_container-links-sign'>
                    <button type ='button'> Sign In </button>
                   <br/>
                   <button type='button'> Sign Up </button> 
                  </div>
                </div> 
              </div> 
            )}
        </div>

        </div> 
    </div>
  )
}

export default Navbar