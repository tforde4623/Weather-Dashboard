// saving main DOM elements to variables
let $cityInput = $('#city-search-input');
let $cityBtn = $('#city-search-btn');
let $recentList = $('#recent-cities');

// DOM elements for main current weather display
let $currentMain = $('#current-header');
let $currentTemp = $('#current-temp');
let $currentHum = $('#current-hum');
let $currentWindSpeed = $('#current-wind-speed');
let $currentUvIndex = $('#current-UvI');

// listener on city search button
$cityBtn.on('click', (e) => {
    e.preventDefault();
    // get city name
    let cityName = $cityInput.val();
    
    // ajax call for city
    $.ajax({
        type: 'GET',
        url: 'http://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&units=imperial&appid=36be3a17aed933ccf53d10149b72f6fb',
        withCredentials: true
    })
        .fail(err => {
            // handle a bad request
            console.log(err)
        })
        .done(res => {
            setCurrent(res);
            addSite(cityName);
        });
});

// setting current weather
// could seperate each one into a function and make them more detailed with what to show if have time
function setCurrent(data) {
    console.log(data);
    // setting date and location in DOM
    $currentMain.text(`${data.name} (${moment().format('MM[/]D[/]YYYY')})`);

    // api icon for current weather
    $currentMain.append(`<img src="http://openweathermap.org/img/w/${data.weather[0].icon}.png" id="weather-icon" alt="weather-icon">`);

    // set temperature in DOM (had to use .html for easier use of UTF symbol)
    $currentTemp.html(`Temperature: ${data.main.temp} &#8457;`);

    // set humidity in DOM
    $currentHum.text(`Humidity: ${data.main.humidity}%`);

    // set wind speed in DOM
    $currentWindSpeed.text(`Wind Speed: ${data.wind.speed} MPH`);

    // set UV index in DOM by calling func (since it needs a WHOLE DIFFERENT AJAX CALL)
    // when calling function, it should take the lat and lon of the previously called api so exactly same place
    setUvIndex(data.coord.lat, data.coord.lon);

    // call function to set 5 day weather
    setWeeklyWeather(data.coord.lat, data.coord.lon)
}

// function for setting UV index
function setUvIndex(lat, lon) {
    $.ajax({
        type: 'GET',
        url: 'http://api.openweathermap.org/data/2.5/uvi?lat=' + lat + '&lon=' + lon + '&appid=36be3a17aed933ccf53d10149b72f6fb'
    })
        .fail(err => console.log(err))
        .done(res => {
            // set DOM to uv index value from response when done
            // maybe change to html and do stuff depending on color
            $currentUvIndex.text(`UV Index: ${res.value}`);
        });
}

// function to set 5 day weather for current city
function setWeeklyWeather(lat, lon) {
    // ajax call to get 5 day weather
    $.ajax({
        type: 'GET',
        url: 'https://api.openweathermap.org/data/2.5/onecall?lat='+ lat +'&lon='+ lon +'&units=imperial&exclude=hourly,minutely,alerts,curent&appid=36be3a17aed933ccf53d10149b72f6fb'
    })
        .fail(err => console.log(err))
        .done(res => {
            // set each days data in DOM
            for (let i = 1; i <= 5; i++) {
                // for loop to loop through daily forecast (starting at 1 cause array in res gives current day as 0)
                // need to turn unix stamp given by api to an actual readable date using moment format
                let dayDate = moment.unix(res.daily[i].dt).format("MM/D/YYYY");
                // current temp using array index
                let dayTemp = res.daily[i].temp.day;
                // current humidity
                let dayHum = `${res.daily[i].humidity} %`;
                // current days weather icon
                let dayIconID = res.daily[i].weather[0].icon
                let dayIconUrl = `http://openweathermap.org/img/w/${dayIconID}.png`
                
                // set html elements using str templates to corrospond with day were referencing from api response since the ids and elements have same num, kinda cool
                $(`#day${i}-date`).text(dayDate);
                $(`#day${i}-img`).attr('src', dayIconUrl);
                $(`#day${i}-temp`).text(`Temp: ${dayTemp}`);
                $(`#day${i}-hum`).text(`Humidity: ${dayHum}`);
            }
        });
}

function addSite(cityName) {
    // getting array from local storage, or setting empty array
    let savedSites = JSON.parse(localStorage.getItem("siteList")) || [];
    let cityList = [];

    // push each value (actual name of city) to city list
    savedSites.forEach(city => {
        cityList.push(city.cityName);
    });

    // check if the searched city name is already in our cityList
    if (!cityList.includes(cityName)) {
        // if searched city is not in list
        savedSites.push({ cityName });
        localStorage.setItem("siteList", JSON.stringify(savedSites));
    }
}