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
const currentHour =
  day.getHours() < 10 ? `0${day.getHours()}:00` : `${day.getHours()}:00`;

const weatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=43.70&longitude=-79.54&hourly=temperature_2m&daily=weathercode&current_weather=true&precipitation_unit=inch&start_date=2023-03-08&end_date=${currentDate}&timezone=America%2FNew_York`;

function Weather() {
  const [temp, setTemp] = useState([]);
  const [hour, setHour] = useState(currentHour);
  const [currentTime, setCurrentTime] = useState([]);
  const [pause, setPause] = useState(false);
  const [graphArr, setGraphArr] = useState([]);

  // FUNCTION: allows you to suspend the update
  const handlePause = () => {
    setPause(!pause);
  };

  // FUNCTION: isolate data for previous five days
  const getFiveDays = (arr) => {
    let newArr = [];
    let hoursArr = arr.time;
    let indices = [
      hoursArr.indexOf(`${firstDay}T${currentHour}`),
      hoursArr.indexOf(`${currentDate}T${currentHour}`),
    ];

    for (let i = indices[0]; i < indices[1]; i++) {
      newArr.push({
        temperature: arr.temperature_2m[i],
        timestamp: hoursArr[i],
      });
    }
    setGraphArr(newArr);
  };

  useEffect(() => {
    // FUNCTION: retrieve data from API, update states
    async function getWeatherData() {
      try {
        const data = await axios.get(weatherAPI);
        let tempData = data.data.hourly.temperature_2m;
        let currentTimeData = data.data.hourly.time;
        let refIndex = currentTimeData.indexOf(`${currentDate}T${hour}`);

        setTemp((prev) => (prev = tempData[refIndex]));
        setCurrentTime((prev) => (prev = currentTimeData[refIndex]));
        getFiveDays(data.data.hourly);
      } catch (e) {
        console.log(e);
      }
    }
    // Update data if condition is met
    if (pause === false) {
      getWeatherData();
    }
    // Update data every 5 min if condition is met
    const interval = setInterval(() => {
      if (pause === false) {
        setHour(currentHour);
        getWeatherData();
      }
    }, 3000);

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
