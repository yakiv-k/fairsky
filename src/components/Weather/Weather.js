import { useState, useEffect } from "react";
import Chart from "../Chart/Chart";

import axios from "axios";

import playIcon from "../../assets/icons/playicon.svg";
import pauseIcon from "../../assets/icons/pauseicon.png";
import searchIcon from "../../assets/icons/search.png";

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

function Weather() {
  const [temp, setTemp] = useState([]);
  const [hour, setHour] = useState(currentHour);
  const [currentTime, setCurrentTime] = useState([]);
  const [pause, setPause] = useState(false);
  const [graphArr, setGraphArr] = useState([]);
  const [search, setSearch] = useState("");
  const [photoRef, setPhotoRef] = useState("");

  const proxyurl = "https://cors-anywhere.herokuapp.com/";
  const apiKey = "AIzaSyBvmSuO1fgGA5SDNHOUuUoYM1yLpsSzZ0M";
  const photoRefAPI = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=photos%2Cgeometry&input=${search}&inputtype=textquery&key=${apiKey}`;

  const imageAPI = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${apiKey}`;

  const weatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=43.70&longitude=-79.54&hourly=temperature_2m&current_weather=true&start_date=2023-03-08&end_date=${currentDate}&timezone=America%2FNew_York`;

  // FUNCTION: allows you to suspend the update
  const handlePause = () => {
    setPause(!pause);
  };

  // FUNCTION: updates state with search input
  const handleSearch = (s) => {
    setSearch(s.target.value);
    axios.get(proxyurl + photoRefAPI).then((r) => {
      {
        if (r.data.status === "OK") {
          // {console.log(r.data.candidates)}
          console.log(r.data.candidates[0].geometry.location);
        }
      }
    });
  };
  // axios.get(proxyurl + photoRefAPI).then(r=> {
  //   {console.log(r.data)}
  // })

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
        // const locationData = await axios.get(proxyurl + photoRefAPI);
        // console.log(locationData.data.candidates)
        // const imageData = await axios.get(proxyurl + weatherAPI);
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
    }, 300000);

    return () => clearInterval(interval);
  }, [pause]);

  return (
    <section className="weather">
      <div className="weather__container">
        <section role="search" className="weather__search">
          <input
            onChange={handleSearch}
            className="weather__input"
            placeholder="Location"
          ></input>
          <img className="weather__image" src={searchIcon}></img>
        </section>
        {/* {} */}
        {/* <div className="weather__results"></div> */}
      </div>
      <div className="weather__content">
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
        <Chart chartData={graphArr} />
      </div>
      <img></img>
    </section>
  );
}

export default Weather;
