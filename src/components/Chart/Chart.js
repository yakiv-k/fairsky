import {
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Text,
    ResponsiveContainer,
  } from "recharts";

  import "./Chart.scss";

  function Chart( {chartData} ) {
    return (
<div className="chart">
        <ResponsiveContainer aspect={2.3}>
          <LineChart width="50%" height={300} data={chartData}>
            <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis
              dataKey="timestamp"
              interval={0}
              style={{
                display: "none",
              }}
              label={
                <Text
                  className="name__x"
                  x={-15}
                  y={0}
                  dx={50}
                  dy={250}
                  offset={0}
                  angle={-90}
                >
                  Temperature
                </Text>
              }
            />
            <YAxis
              label={
                <Text
                  className="name__y"
                  x={0}
                  y={420}
                  dx={475}
                  dy={0}
                  offset={0}
                  angle={0}
                >
                  Timestamp
                </Text>
              }
            />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  };

  export default Chart;