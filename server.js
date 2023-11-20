const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  // Pass an empty object as weatherData when the page loads without a city name.
  res.render("index", { weatherData: {} });
});

app.post("/", (req, res) => {
  const cityName = req.body.cityName;

  if (!cityName) {
    // If the cityName is empty, render the index.ejs without making the API request.
    return res.render("index", {
      error: "Please enter a city name to get the weather data.",
    });
  }

  const apiKey = process.env.WEATHER_API;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;

  https
    .get(url, (response) => {
      let rawData = "";
      response.on("data", (chunk) => {
        rawData += chunk;
      });

      response.on("end", () => {
        try {
          const weatherData = JSON.parse(rawData);
          console.log(weatherData);
          res.render("index", { weatherData: weatherData || {} });
        } catch (error) {
          console.error("Error parsing weather data:", error);
          res.render("index", {
            error: "Error fetching weather data. Please try again later.",
          });
        }
      });
    })
    .on("error", (error) => {
      console.error("Error making API request:", error);
      res.render("index", {
        error: "Error fetching weather data. Please try again later.",
      });
    });
});

app.listen(3000);
