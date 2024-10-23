import React from 'react';
import './possibility.css';
import axios from 'axios'; // Import axios library

const fetchSolarData = async () => {
  try {

    const apiUrl = 'https://power.larc.nasa.gov/api/temporal/monthly/point?start=2000&end=2022&latitude=39.961178&longitude=-82.998795&community=ag&parameters=ALLSKY_SFC_SW_DWN&header=true';
    const response = await axios.get(apiUrl);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching solar data:', error);
    throw error;
  }
};

const Possibility = () => {
  return (

    <div className="possibility">
      <h1>Check Solar Possibility</h1>
      <button onClick={fetchSolarData}>Check Solar Possibility</button>
    </div>
    );
};

export default Possibility;
