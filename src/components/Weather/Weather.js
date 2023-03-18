import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Text,
} from "recharts";
import axios from "axios";

import playIcon from "../../assets/icons/playicon.svg";
import pauseIcon from "../../assets/icons/pauseicon.png";
import "./Weather.scss";

// Date and time variables used to isolate data
const day = new Date();
const currentDate = `${day.getFullYear()}-0${
  day.getMonth() + 1
}-${day.getDate()}`;
// Exact date/time five days prior to current date/time
const firstDay = `${day.getFullYear()}-0${day.getMonth() + 1}-${
  day.getDate() - 5
}`;
const currentHour = day.getHours() < 10 ? `0${day.getHours()}:00` : `${day.getHours()}:00`;
// API URL
const weatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=43.70&longitude=-79.54&hourly=temperature_2m&daily=weathercode&current_weather=true&precipitation_unit=inch&start_date=2023-03-08&end_date=${currentDate}&timezone=America%2FNew_York`;

function Weather() {
  // State for current temperature
  const [temp, setTemp] = useState([]);
  // State for current time
  const [currentTime, setCurrentTime] = useState([]);
  // State for suspense of data
  const [pause, setPause] = useState(false);
  // State for array passed to Rechart.js graph
  const [graphArr, setGraphArr] = useState([]);

  // FUNCTION: allows you to suspend the update
  const handlePause = () => {
    setPause(!pause);
  };

  // FUNCTION: isolate data for previous five days
  const getFiveDays = (arr) => {
    let newArr = [];
    let hoursArr = arr.time;
    // index positions for temperature/timestamp exactly five days ago and current day
    let indices = [
      hoursArr.indexOf(`${firstDay}T${currentHour}`),
      hoursArr.indexOf(`${currentDate}T${currentHour}`),
    ];

    // isolate 5 day data from API, return array of objects containing key value pairs for
    // both pieces of data
    for (let i = indices[0]; i < indices[1]; i++) {
      newArr.push({
        temperature: arr.temperature_2m[i],
        timestamp: hoursArr[i],
      });
    }
    // update state: graphdata
    setGraphArr(newArr);
  };

  useEffect(() => {
    // ASYNC FUNCTION: retrieve data from API, update states
    async function getWeatherData() {
      try {
        // call API
        const data = await axios.get(weatherAPI);
        // variables for temperature array and timestamp array in return data
        let tempData = data.data.hourly.temperature_2m;
        let currentTimeData = data.data.hourly.time;
        // index of data matching current timestamp
        let refIndex = currentTimeData.indexOf(`${currentDate}T${currentHour}`);
        // set states
        setTemp(tempData[refIndex]);
        setCurrentTime(currentTimeData[refIndex]);
        getFiveDays(data.data.hourly);
      } catch (e) {
        // log error if call is unsuccesful
        console.log(e);
      }
    }

    // run our function/update states on mount
    getWeatherData();

    // Update data every 5 min if condition is met
    const interval = setInterval(() => {
      if (pause === false) {
        getWeatherData();
      }
    }, 50000);

    // cleanup function runs on unmount
    return () => clearInterval(interval);
  }, [pause]);

  return (
    <section className="weather">
      <div className="weather__display display">
        <h1 className="display__title">Toronto</h1>
        <div className="display__stat">
          <label className="display__label">Temperature</label>
          <div className="display__data">{temp} °C</div>
        </div>
        <div className="display__stat">
          <label className="display__label">Last measured at</label>
          <div className="display__data--size">{currentTime}</div>
        </div>
        <button onClick={handlePause} className="display__button">
          <img
            className="display__icon"
            src={pause === false ? pauseIcon : playIcon}
            alt="play/pause icon"
          ></img>
        </button>
      </div>
      <LineChart width={600} height={300} data={graphArr}>
        <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
        <CartesianGrid stroke="#ccc" />
        <XAxis
          dataKey="timestamp"
          interval={0}
          style={{
            display: "none",
          }}
          label={
            <Text x={-15} y={0} dx={50} dy={175} offset={0} angle={-90}>
              Temperature
            </Text>
          }
        />
        <YAxis
          label={
            <Text x={0} y={290} dx={275} dy={0} offset={0} angle={0}>
              Timestamp
            </Text>
          }
        />
        <Tooltip />
      </LineChart>
    </section>
  );
}

export default Weather;
