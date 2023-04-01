import { useState, useEffect } from "react";
import Chart from "../Chart/Chart";

import axios from "axios";

import playIcon from "../../assets/icons/playicon.svg";
import pauseIcon from "../../assets/icons/pauseicon.png";
import searchIcon from "../../assets/icons/search.png";

import "./Weather.scss";

// Date and time variables used to isolate data
const day = new Date();
const pastDayRef = new Date(day - 1000 * 60 * 60 * 24 * 5);
const currentDate =
  day.getDate() < 10
    ? `${day.getFullYear()}-0${day.getMonth() + 1}-0${day.getDate()}`
    : `${day.getFullYear()}-0${day.getMonth() + 1}-${day.getDate()}`;
// Exact date/time five days prior to current date/time

const prevDay =
  pastDayRef.getDate() < 10
    ? `${pastDayRef.getFullYear()}-0${pastDayRef.getMonth() + 1}-0${pastDayRef.getDate()}`
    : `${pastDayRef.getFullYear()}-0${pastDayRef.getMonth() + 1}-${pastDayRef.getDate()}`;

const currentHour =
  day.getHours() < 10 ? `0${day.getHours()}:00` : `${day.getHours()}:00`;

  const firstDay = `${day.getFullYear()}-0${day.getMonth() + 1}-${
    day.getDate() - 5
  }`;

function Weather() {
  const [temp, setTemp] = useState([]);
  const [hour, setHour] = useState(currentHour);
  const [currentTime, setCurrentTime] = useState([]);
  const [pause, setPause] = useState(false);
  const [graphArr, setGraphArr] = useState([]);
  const [search, setSearch] = useState([]);
  const [coordinates, setCoordinates] = useState([43.7, -79.54]);

  const apiKey = "886705b4c1182eb1c69f28eb8c520e20";
  const locationAPI = "https://wft-geo-db.p.rapidapi.com/v1/geo";
  const weatherAPI = `https://api.open-meteo.com/v1/forecast?latitude=43.70&longitude=-79.54&hourly=temperature_2m&current_weather=true&start_date=${prevDay}&end_date=${currentDate}&timezone=America%2FNew_York`;
  const geoAPIOptions = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "42c25916ddmshd0dfe1856ff4edcp14f04fjsnc7898c732bb9",
      "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
    },
  };

  // FUNCTION: allows you to suspend the update
  const handlePause = () => {
    setPause(!pause);
  };

  // FUNCTION: updates state with search input
  const handleSearch = (s) => {
    if (s.target.value) {
      axios
        .get(
          `${locationAPI}/cities?minPopulation=100&namePrefix=${s.target.value}`,
          geoAPIOptions
        )
        .then((response) => {
          setSearch(response.data.data);
          console.log(response.data)
        });
    }
  };
                                                                                                                             
  const handleCoordinates = (e) => {
    let index = e.target.getAttribute("data");
    let latLong = [search[index].latitude, search[index].longitude];
    setCoordinates(latLong);
  };

  // FUNCTION: isolate data for previous five days
  const getFiveDays = (arr) => {
    let newArr = [];
    let hoursArr = arr.time;
    let indices = [
      hoursArr.indexOf(`${prevDay}T${currentHour}`),
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
    }, 300000);

    return () => clearInterval(interval);
  }, [pause]);

  return (
    <section className="weather">
      <div className="weather__partition">
        <div className="weather__container">
          <section role="search" className="weather__search">
            <input
              onClick={handleSearch}
              className="weather__input"
              placeholder="Location"
            ></input>
            <img className="weather__image" src={searchIcon}></img>
          </section>
          {search.length ? (
            <div className="weather__dropdown">
              <div className="weather__subcontainer">
                {search.map((result, i) => {
                  return (
                    <div
                      className="weather__results"
                      onClick={handleCoordinates}
                      data={i}
                      key={i}
                    >
                      {" "}
                      {`${result.city}, ${result.region}, ${result.country}`}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div></div>
          )}
        </div>
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
