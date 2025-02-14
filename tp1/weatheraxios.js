const axios = require('axios');

const API_KEY = "38f9264b8e345e5059d64b5e08c19663";
const BASE_URL = "http://api.openweathermap.org/data/2.5/weather?appid=" + API_KEY + "&units=metric&lang=fr&q=";

async function getWeatherData(city, callback) {
    const url = BASE_URL + city;
    try {
        const response = await axios.get(url);
        const weatherData = response.data;
        if (weatherData.cod !== 200) {
            callback(weatherData.message, null);
        } else {
            const result = {
                temperature: weatherData.main.temp,
                description: weatherData.weather[0].description,
                humidity: weatherData.main.humidity
            };
            callback(null, result);
        }
    } catch (error) {
        callback(error, null);
    }
}

getWeatherData('Sousse', function (error, weatherData) {
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Temperature: ' + weatherData.temperature + '°C');
        console.log('Description: ' + weatherData.description);
        console.log('Humidity: ' + weatherData.humidity + '%');
    }
});