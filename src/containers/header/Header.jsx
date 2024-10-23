import React from 'react';
import './header.css';
import BlockO from '../../Assets/BlockOLogo.png';

const Header = () => {
  return (
    <div className="solar__header section__padding" id='Home'>
      <div className="solar__header-content">
        <h1 className="gradient__text">Helping Communities Globally Through Solar Power!</h1>
        <p> Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum. </p>
        <div className="solar__header-content__input">
          <input type="email" placeholder="Enter Your Email" />
          <button type='button'>Get Started</button>
        </div>   
      </div>
      <div className="solar__header-image">
        <img src={BlockO} alt="BlockO" />
      </div> 
    </div>
  )
}

export default Header