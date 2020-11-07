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
        url: 'http://api.openweathermap.org/data/2.5/weather?q='+ cityName +'&units=imperial&appid=36be3a17aed933ccf53d10149b72f6fb'
    })
        .fail(err => {
            // handle a bad request
            console.log(err)
        })
        .done(res => {
            console.log(res);
            setCurrent(res);
        });
});

// setting current weather
// could seperate each one into a function and make them more detailed with what to show if have time
function setCurrent(data) {
    // setting date and location in DOM
    $currentMain.text(`${data.name} (${moment().format('MM[/]D[/]YYYY')})`);

    // set temperature in DOM (had to use .html for easier use of UTF symbol)
    $currentTemp.html(`Temperature: ${data.main.temp} &#8457;`);

    // set humidity in DOM
    $currentHum.text(`Humidity: ${data.main.humidity}%`);

    // set wind speed in DOM
    $currentWindSpeed.text(`Wind Speed: ${data.wind.speed} MPH`);

    // set UV index in DOM by calling func (since it needs a WHOLE DIFFERENT AJAX CALL)
    // when calling function, it should take the lat and lon of the previously called api so exactly same place
    setUvIndex(data.coord.lat, data.coord.lon);
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