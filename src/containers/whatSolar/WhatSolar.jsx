import React from 'react';
import './whatSolar.css';
import { Feature } from '../../components';

const featuresData = [
  {
    title: 'What is Solar Power?',
    text: 'Solar power works by converting energy from the sun into power. Solar Power is generated through the use of solar panels, which range in size from residential rooftops to ‘solar farms’ stretching over acres of rural land.',
  },
  {
    title: 'Solar Panels',
    text: 'PV cells are the small units in solar panels that turn sunlight into electricity. It is important to know how they work and how efficient they are. Solar panels come in different types, like monocrystalline, polycrystalline, and thin-film, each with its own efficiency, cost, and way of installation.',
  },
  {
    title: 'Energy Storage',
    text: 'Solar energy isn\'t always available (like at night or on cloudy days), so we need to store it in things like batteries. It\'s also important to know how solar energy fits into the regular electricity grid, making sure there\'s always enough power available, even when the sun isn\'t shining.',
  },
  {
    title: 'Enviornmentally Friendly',
    text: 'Solar energy is great for the environment because it doesn\'t create harmful gases like fossil fuels. But, it\'s also important to think about the environmental effects of making, moving, and getting rid of solar panels. Knowing about the whole life of solar energy systems, from creation to recycling, is an important part of understanding solar energy.',
  },
];

const WhatSolar = () => {
  return (
    <div className="gpt3__features section__padding" id="features">
    <div className="gpt3__features-heading">
      <h1 className="gradient__text">The Future is Solar and You Just Need to Realize It! Step into Future Today through Solar Power!</h1>
      
    </div>
    <div className="gpt3__features-container">
      {featuresData.map((item, index) => (
        <Feature title={item.title} text={item.text} key={item.title + index} />
      ))}
    </div>
  </div>
  )
}

export default WhatSolar