import './styles.css';
import maxtemp from '../assets/temperature-snow-svgrepo-com.svg';
import mintemp from '../assets/temperature-sun-svgrepo-com.svg';
import avgtemp from '../assets/temperature-low-svgrepo-com.svg';
import humidity from '../assets/humidity-svgrepo-com.svg';
import chanceofrain from '../assets/rain-svgrepo-com.svg';

// fetch(
//     'https://api.weatherapi.com/v1/current.json?key=91e2728ed3854429add53229242906&q=singapore'
// )
//     .then((response) => {
//         return response.json();
//     })
//     .then((response) => {
//         console.log(response);
//     })
//     .catch((error) => {
//         console.log(error);
//     });

class Country {
    constructor(name, country, time) {
        this.name = name;
        this.country = country;
        this.time = time;
    }

    editCountryDom() {
        const countryTitle = document.querySelector('.subheader.country');
        const timeTitle = document.querySelector('.subheader.time');
        countryTitle.textContent = `${this.name}, ${this.country}`;
        timeTitle.textContent = `${this.time}`;
    }
}

class Hour {
    constructor(time, img, info) {
        this.time = time;
        this.img = img;
        this.info = info;
    }

    createHourDom() {
        const div = document.createElement('div');
        const hourTime = document.createElement('p');
        const content = document.createElement('p');
        const image = document.createElement('img');

        div.classList.add('hour');
        image.src = `https:` + this.img;
        hourTime.textContent = this.time;
        content.textContent = this.info + `\u00B0C`;

        div.appendChild(hourTime);
        div.appendChild(image);
        div.appendChild(content);

        return div;
    }
}

class Day {
    constructor(max, min, avg, humidity, rain, description, icon) {
        this.max = max;
        this.min = min;
        this.avg = avg;
        this.humidity = humidity;
        this.rain = rain;
        this.description = description;
        this.icon = icon;
    }

    create3DaysForecastDom() {
        const div = document.createElement('div');
        const image = document.createElement('img');
        const descriptionContainer = document.createElement('div');
        const avgtemp = document.createElement('p');
        const text = document.createElement('p');
        const chance = document.createElement('p');

        image.src = `https:` + this.icon;
        avgtemp.textContent = this.avg + `\u00B0C`;
        text.textContent = this.description;
        chance.textContent = this.rain + '%';

        div.classList.add('day-container');
        image.classList.add('svg');
        descriptionContainer.classList.add('day-desc-container');

        descriptionContainer.appendChild(avgtemp);
        descriptionContainer.appendChild(text);
        descriptionContainer.appendChild(chance);

        div.appendChild(image);
        div.appendChild(descriptionContainer);

        return div;
    }
}

function updateForecast(max, min, avg, humidity, chance, description) {
    document.querySelector('#max-temp').textContent = max + `\u00B0C`;
    document.querySelector('#min-temp').textContent = min + `\u00B0C`;
    document.querySelector('#avg-temp').textContent = avg + `\u00B0C`;
    document.querySelector('#humidity').textContent = humidity + '%';
    document.querySelector('#chance-of-rain').textContent = chance + '%';
    document.querySelector('.description-container > p').textContent =
        description;
}

function resetDom() {
    const form = document.querySelector('form');
    const hourly = document.querySelector('.hourly-forecast-container');
    const daysContainer = document.querySelector('.days-container');
    const countryTitle = document.querySelector('.subheader.country');
    const timeTitle = document.querySelector('.subheader.time');
    const minDom = document.querySelector('#min-temp');
    const maxDom = document.querySelector('#max-temp');
    const avgDom = document.querySelector('#avg-temp');
    const humidityDom = document.querySelector('#humidity');
    const chanceDom = document.querySelector('#chance-of-rain');

    form.reset();
    hourly.textContent = '';
    daysContainer.textContent = '';
    countryTitle.textContent = '';
    timeTitle.textContent = '';
    minDom.textContent = '';
    maxDom.textContent = '';
    avgDom.textContent = '';
    humidityDom.textContent = '';
    chanceDom.textContent = '';
}

function domController() {
    // let measurement = 'F';
    const form = document.querySelector('form');
    const hourly = document.querySelector('.hourly-forecast-container');
    const daysContainer = document.querySelector('.days-container');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = await getWeatherData(
            document.querySelector('input').value
        );

        resetDom();

        data.today.forEach((hour) => {
            const currentHour = new Hour(
                hour.weatherDataCelsius.time,
                hour.weatherDataCelsius.icon,
                hour.weatherDataCelsius.temp
            );
            hourly.appendChild(currentHour.createHourDom());
        });

        data.days.forEach((day) => {
            const currentDay = new Day(
                day.weatherDataCelsius.max,
                day.weatherDataCelsius.min,
                day.weatherDataCelsius.avg,
                day.weatherDataCelsius.humidity,
                day.weatherDataCelsius.rain,
                day.weatherDataCelsius.description,
                day.weatherDataCelsius.icon
            );
            daysContainer.appendChild(currentDay.create3DaysForecastDom());
        });

        const currentDay = data.days[0];
        updateForecast(
            currentDay.weatherDataCelsius.max,
            currentDay.weatherDataCelsius.min,
            currentDay.weatherDataCelsius.avg,
            currentDay.weatherDataCelsius.humidity,
            currentDay.weatherDataCelsius.rain,
            currentDay.weatherDataCelsius.description
        );

        const userCountry = new Country(
            data.country.name,
            data.country.country,
            data.country.time
        );
        userCountry.editCountryDom();
    });
}

const getWeatherData = async (input = 'Singapore') => {
    try {
        // data for all 3 days
        const data = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=91e2728ed3854429add53229242906&q=${input}&days=3`,
            { mode: 'cors' }
        );
        const response = await data.json();
        const forecastdata = response.forecast.forecastday;

        // get country data
        const countrydata = response.location;
        const country = createCountryObj(
            countrydata.name,
            countrydata.country,
            countrydata.localtime
        );

        // today's data
        const today = [];
        const todaydata = forecastdata[0].hour;
        todaydata.forEach((hourdata) => {
            const hour = {};
            hour.weatherDataCelsius = createHourObj(
                hourdata.time.split(' ')[1],
                hourdata.temp_c,
                hourdata.condition.icon
            );
            hour.weatherDataFahrenheit = createHourObj(
                hourdata.time.split(' ')[1],
                hourdata.temp_f,
                hourdata.condition.icon
            );
            today.push(hour);
        });

        // forecast data
        const days = [];
        forecastdata.forEach((daydata) => {
            const day = {};
            day.weatherDataCelsius = createWeatherObj(
                daydata.day.maxtemp_c,
                daydata.day.mintemp_c,
                daydata.day.avgtemp_c,
                daydata.day.avghumidity,
                daydata.day.daily_chance_of_rain,
                daydata.day.condition.text,
                daydata.day.condition.icon
            );
            day.weatherDataFahrenheit = createWeatherObj(
                daydata.day.maxtemp_f,
                daydata.day.mintemp_f,
                daydata.day.avgtemp_f,
                daydata.day.avghumidity,
                daydata.day.daily_chance_of_rain,
                daydata.day.condition.text,
                daydata.day.condition.icon
            );
            days.push(day);
        });
        return {
            country,
            today,
            days,
        };
    } catch (error) {
        console.log(error);
    }
};

const createCountryObj = (name, country, time) => {
    return {
        name,
        country,
        time,
    };
};

const createWeatherObj = (max, min, avg, humidity, rain, description, icon) => {
    return {
        max,
        min,
        avg,
        humidity,
        rain,
        description,
        icon,
    };
};

const createHourObj = (time, temp, icon) => {
    return {
        time,
        temp,
        icon,
    };
};

domController();
getWeatherData();
