import "./Weather.scss";

function Weather() {
  return (
    <section className="weather">
      <div className="weather__display display">
        <h1 className="display__title">Outdoor temperature</h1>
        <div className="display__stat">
          <label>Temperature</label>
          <input></input>
        </div>
        <div className="display__stat">
          <label>Last measured at</label>
          <input></input>
        </div>
        <button className="display__button">Pause/Resume</button>
      </div>
    </section>
  );
}

export default Weather;
