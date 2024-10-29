import React, { useState } from 'react';
import './features.css';
import { Feature } from '../../components';
import axios from 'axios';

const SolarQuestions = [
  {
    type: 'number',
    questionText: 'What is your Longitude?',
    step: 0.0001,
  },
  {
    type: 'number',
    questionText: 'What is your latitude?',
    step: 0.0001,
  },
  {
    type: 'select',
    questionText: 'Do you plan your system to be Roof or Ground Mounted System?',
    options: ['Roof Mounted', 'Ground Mounted'],
  },
  {
    type: 'number',
    questionText: 'How much space do you have for the Panels in square meters (m^2)?',
    min: 1.66,
    step: 0.01,
  },
  {
    type: 'number',
    questionText: 'Estimate how much shade may obstruct the panels during the day: (0-100%)',
    min: 0,
    max: 100,
    step: 1,
  },
  {
    type: 'number',
    questionText: `What is the total Wattage of the systems you would like to power?
    Please consider the individual power consumption of each device per hour:
    Fridge ~ (300W - 800W), Stove ~ (1KW - 3KW), Air Condition ~ (1KW - 4KW), Home Lighting ~ (100W-500W), etc.`,
    min: 400,
    step: 1,
  },
  {
    type: 'number',
    questionText: 'What is your estimated budget for this project? (USD)',
    min: 150,
  }
];

const Features = () => {
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { value, checked, type } = e.target;
    setError(''); // Clear error when user starts typing
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

  const validateCurrentAnswer = () => {
    const currentAnswer = answers[currentQuestionIndex];
    const currentQuestion = SolarQuestions[currentQuestionIndex];

    if (!currentAnswer || currentAnswer === '') {
      setError('Please answer the question before proceeding.');
      return false;
    }

    if (currentQuestion.type === 'number') {
      const numValue = Number(currentAnswer);
      if (isNaN(numValue)) {
        setError('Please enter a valid number.');
        return false;
      }
      if (currentQuestion.min !== undefined && numValue < currentQuestion.min) {
        setError(`Please enter a number greater than or equal to ${currentQuestion.min}.`);
        return false;
      }
    }

    if (currentQuestion.type === 'select' && currentAnswer === '') {
      setError('Please select an option.');
      return false;
    }

    setError('');
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentAnswer()) {
      return;
    }

    if (currentQuestionIndex < SolarQuestions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setIsQuizCompleted(true);
      makeApiCallforDNIDHI();
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
          <div key={questionIndex} className="quiz-results-item">
            <p className="quiz-question-text">
              <b>Question {parseInt(questionIndex) + 1}:</b> {SolarQuestions[questionIndex].questionText}
            </p>
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
  
      const swDownValues = Object.values(data.properties.parameter.ALLSKY_SFC_SW_DWN);
      const swDownAvg = swDownValues[12];
  
      const swDiffValues = Object.values(data.properties.parameter.ALLSKY_SFC_SW_DIFF);
      const swDiffAvg = swDiffValues[12];
  
      const GHI = (swDownAvg * averageZenithAngle) + swDiffAvg;
  
      const onePanelProd = (.23104 * GHI);
      const load = answers[5];
      const panelNumbers = [1, 2, 6, 12, 18];
      let numPanel = 0;
      
      for (let i = 0; i < panelNumbers.length; i++) {
        if (load <= panelNumbers[i] * onePanelProd) {
          numPanel = panelNumbers[i];
          break;
        }
      }

      setApiResponse({
        GHI,
        onePanelProd,
        recommendedPanels: numPanel,
        totalCapacity: numPanel * onePanelProd
      });

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
  
      if (data?.properties?.parameter?.SG_MID_COZ_ZEN_ANG) {
        const zenithAngleValues = Object.values(data.properties.parameter.SG_MID_COZ_ZEN_ANG);
        const filteredValues = zenithAngleValues.filter(value => value !== -999);
        const averageZenithAngle = filteredValues.reduce((sum, value) => sum + value, 0) / filteredValues.length;
        return averageZenithAngle;
      } else {
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
              <div className="quiz-results api-results">
                <h3>System Recommendations</h3>
                <div className="recommendation-item">
                  <p><strong>Solar Irradiance (GHI):</strong> {apiResponse.GHI.toFixed(2)} kWh/m²</p>
                  <p><strong>Single Panel Production:</strong> {apiResponse.onePanelProd.toFixed(2)} kW</p>
                  <p><strong>Recommended Number of Panels:</strong> {apiResponse.recommendedPanels}</p>
                  <p><strong>Total System Capacity:</strong> {apiResponse.totalCapacity.toFixed(2)} kW</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="quiz-question">
              <div className="quiz-question-text">
                {question.questionText.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}<br/>
                  </React.Fragment>
                ))}
              </div>
              
              {question.type === 'text' && (
                <input
                  className="quiz-input"
                  type="text"
                  value={answers[currentQuestionIndex] || ''}
                  onChange={handleChange}
                  placeholder="Enter your answer"
                />
              )}
              
              {question.type === 'select' && (
                <select
                  className="quiz-select"
                  value={answers[currentQuestionIndex] || ''}
                  onChange={handleChange}
                >
                  <option value="">Select an option...</option>
                  {question.options.map((option, idx) => (
                    <option key={idx} value={option}>{option}</option>
                  ))}
                </select>
              )}
              
              {question.type === 'number' && (
                <input
                  className="quiz-input"
                  type="number"
                  value={answers[currentQuestionIndex] || ''}
                  onChange={handleChange}
                  min={question.min || 0}
                  step={question.step || 1}
                  placeholder="Enter a number"
                />
              )}
              
              {question.type === 'checkbox' && (
                <div className="quiz-checkbox-group">
                  {question.options.map((option, idx) => (
                    <div key={idx} className="quiz-checkbox-item">
                      <label>
                        <input
                          type="checkbox"
                          value={option}
                          checked={answers[currentQuestionIndex] ? answers[currentQuestionIndex].includes(option) : false}
                          onChange={handleChange}
                        />
                        <span>{option}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {error && <div className="quiz-error">{error}</div>}
            </div>
            
            <div className="questionnaire-navigation">
              {currentQuestionIndex > 0 && (
                <button 
                  type="button" 
                  onClick={handlePrevious}
                  className="quiz-button quiz-button-previous"
                >
                  Previous
                </button>
              )}
              <button 
                type="button" 
                onClick={handleNext}
                className="quiz-button quiz-button-next"
              >
                {currentQuestionIndex < SolarQuestions.length - 1 ? 'Next' : 'Finish'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Features;