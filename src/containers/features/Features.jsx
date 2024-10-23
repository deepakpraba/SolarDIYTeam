import React, { useState, useEffect } from 'react';
import './features.css';
import { Feature } from '../../components';
import axios from 'axios'; // Import axios library

const SolarQuestions = [
  {
    type: 'number',
    questionText: 'What is your Longitude?',
    step: 0.0001,

  },
  {
    type: 'number',
    questionText: 'What is your latitude?',
  },
  {
    type: 'select',
    questionText: 'Do you plan your system to be Roof or Ground Mounted System?',
    options: ['Roof Mounted', 'Ground Mounted'],
  },
  {
    type: 'number',
    questionText: 'How much space do you have for the Panels in square meters (m^2)?',
    min: 0,
    step: 1,
  },
  {
    type: 'number',
    questionText: 'Estimate how much shade may obstruct the panels during the day: (0-100%)',
    min: 0,
    step: 1,
  },
  {
    type: 'number',
    questionText: `What is the total KW of the systems you would like to power?
    Please consider the individual power consumption of each device per hour:
    Fridge ~ (300W - 800W), Stove ~ (1KW - 3KW), Air Condition ~ (1KW - 4KW), Home Lighting ~ (100W-500W), etc.`,
    min: 0,
    step: 1,
  },
  {
    type: 'number',
    questionText: 'What is your estimated budget for this project? (USD)',
    min: 0,
  }
  // Add more questions as needed
];

const Features = () => {
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [apiResponse, setApiResponse] = useState(null); // State to store API response

  const handleChange = (e) => {
    const { value, checked, type } = e.target;
    if (type === 'checkbox') {
      const prevValues = answers[currentQuestionIndex] || [];
      if (checked) {
        setAnswers(prevAnswers => ({
          ...prevAnswers,
          [currentQuestionIndex]: [...prevValues, value]
        }));
      } else {
        setAnswers(prevAnswers => ({
          ...prevAnswers,
          [currentQuestionIndex]: prevValues.filter(val => val !== value)
        }));
      }
    } else {
      setAnswers(prevAnswers => ({
        ...prevAnswers,
        [currentQuestionIndex]: value
      }));
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < SolarQuestions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setIsQuizCompleted(true); // Update to set quiz as completed
      makeApiCallforDNIDHI(); // Call the API after completing the quiz
    // After the API calls are made, do the calculation to get GHI 
    
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  const renderResults = () => {
    return (
      <div className="quiz-results">
        <h2>Your Quiz Results</h2>
        {Object.keys(answers).map((questionIndex) => (
          <div key={questionIndex}>
            <p><b>Question {parseInt(questionIndex) + 1}:</b> {SolarQuestions[questionIndex].questionText}</p>
            <p><b>Your Answer:</b> {answers[questionIndex]}</p>
          </div>
        ))}
      </div>
    );
  };

  const makeApiCallforDNIDHI = async () => {
    try {
      const averageZenithAngle = await makeApiCallforSZA();
      const apiUrl = `https://power.larc.nasa.gov/api/temporal/monthly/point?start=2022&end=2022&latitude=${answers[1]}&longitude=${answers[0]}&community=ag&parameters=ALLSKY_SFC_SW_DWN%2CALLSKY_SFC_SW_DIFF&header=true`;
  
      const response = await axios.get(apiUrl);
      const data = response.data;
  
      // Calculate average for ALLSKY_SFC_SW_DWN
      const swDownValues = Object.values(data.properties.parameter.ALLSKY_SFC_SW_DWN);
      const swDownAvg = swDownValues[12]; // Use the 13th value (index 12) as the annual average
  
      // Calculate average for ALLSKY_SFC_SW_DIFF
      const swDiffValues = Object.values(data.properties.parameter.ALLSKY_SFC_SW_DIFF);
      const swDiffAvg = swDiffValues[12]; // Use the 13th value (index 12) as the annual average
  
      // Calculate GHI
      const GHI = (swDownAvg * averageZenithAngle) + swDiffAvg;
  
      console.log('Average ALLSKY_SFC_SW_DWN:', swDownAvg);
      console.log('Average ALLSKY_SFC_SW_DIFF:', swDiffAvg);
      console.log('Average Zenith Angle:', averageZenithAngle);
      console.log('GHI:', GHI);
      
      // Calculate the production of one panel
      const onePanelProd =(.23104 *GHI);
      console.log('One Panel Production:', onePanelProd);
      //Find the Load from the Questionnaire
      const load = answers[5];
      //Match to the specific Systems
      const panelNumbers = [1,2,6,12,18];
      let numPanel = 0; 
      for (let i = 0; i < panelNumbers.length; i++) {
        console.log('Entering Loop')
        if(load <= panelNumbers[i] * onePanelProd){
          console.log('Found the number of Panels:'); 
          numPanel = panelNumbers[i];
        }
      }
      console.log('Number of Panels:', numPanel);

      return GHI;
    } catch (error) {
      console.error('Error fetching solar data:', error);
      throw error;
    }
  };
  

      const makeApiCallforSZA = async () => {
        try {
          const apiUrl = `https://power.larc.nasa.gov/api/temporal/climatology/point?start=2020&end=2022&latitude=${answers[1]}&longitude=${answers[0]}&community=ag&parameters=SG_MID_COZ_ZEN_ANG&header=true`;
          const response = await axios.get(apiUrl);
          const data = response.data;
      
          // Check if the required properties exist
          if (data && data.properties && data.properties.parameter && data.properties.parameter.SG_MID_COZ_ZEN_ANG) {
            // Extract the values for SG_MID_COZ_ZEN_ANG
            const zenithAngleValues = Object.values(data.properties.parameter.SG_MID_COZ_ZEN_ANG);
      
            // Remove the "ANN" value before calculating the average
            const filteredValues = zenithAngleValues.filter(value => value !== -999);
      
            // Calculate the average
            const averageZenithAngle = filteredValues.reduce((sum, value) => sum + value, 0) / filteredValues.length;
      
            console.log('Average SG_MID_COZ_ZEN_ANG:', averageZenithAngle);
            return averageZenithAngle;
          } else {
            console.error('API response does not have the expected structure');
            throw new Error('API response does not have the expected structure');
          }
        } catch (error) {
          console.error('Error fetching solar data:', error);
          throw error;
        }
      };
  
    
  const question = SolarQuestions[currentQuestionIndex];

  return (
    <div className="solar__whatSolar section__margin" id="whatSolar">
      <div className="solar__whatSolar-questions">
        <h2 className="gradient__text">Answer this Quiz and Find out what Plan works for You!</h2>
        {isQuizCompleted ? (
          <>
            {renderResults()}
            {apiResponse && (
              <div>
                <h3>API Response:</h3>
                <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={(e) => e.preventDefault()}>
            <div key={currentQuestionIndex}>
              {question.questionText.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}<br/>
                </React.Fragment>
              ))}
              {question.type === 'text' && (
                <input
                  type="text"
                  value={answers[currentQuestionIndex] || ''}
                  onChange={handleChange}
                />
              )}
              {question.type === 'select' && (
                <select
                  value={answers[currentQuestionIndex] || ''}
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  {question.options.map((option, idx) => (
                    <option key={idx} value={option}>{option}</option>
                  ))}
                </select>
              )}
              {question.type === 'number' && (
                <input
                  type="number"
                  value={answers[currentQuestionIndex] || ''}
                  onChange={handleChange}
                  min={question.min || 0}
                  step={question.step || 1}
                />
              )}
              {question.type === 'checkbox' && question.options.map((option, idx) => (
                <div key={idx}>
                  <label>
                    <input
                      type="checkbox"
                      value={option}
                      checked={answers[currentQuestionIndex] ? answers[currentQuestionIndex].includes(option) : false}
                      onChange={handleChange}
                    />
                    {option}
                  </label>
                </div>
              ))}
            </div>
            <div className="questionnaire-navigation">
              {currentQuestionIndex > 0 && (
                <button type="button" onClick={handlePrevious}>Previous</button>
              )}
              {currentQuestionIndex < SolarQuestions.length - 1 ? (
                <button type="button" onClick={handleNext}>Next</button>
              ) : (
                <button type="button" onClick={handleNext}>Finish</button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Features;