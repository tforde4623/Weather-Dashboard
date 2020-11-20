// saving main DOM elements to variables
let $cityInput = $("#city-search-input");
let $cityBtn = $("#city-search-btn");
let $recentList = $("#recent-cities");

// DOM elements for main current weather display
let $currentMain = $("#current-header");
let $currentTemp = $("#current-temp");
let $currentHum = $("#current-hum");
let $currentWindSpeed = $("#current-wind-speed");
let $currentUvIndex = $("#current-UvI");

// global list of city names so we can access outside function
let cityNames;

// on load display recent cities
$(document).ready(() => {
  displayRecent();
});

// listener on city search button
$cityBtn.on("click", (e) => {
  e.preventDefault();
  // get city name
  let cityNameInp = $cityInput.val();
  // make sure the first letter of city is upper case
  let cityName = cityNameInp.charAt(0).toUpperCase() + cityNameInp.slice(1);
  callAPI(cityName);
});

// function to handle api call for whatever city
function callAPI(cityName) {
  // ajax call for city
  $.ajax({
    type: "GET",
    url:
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      cityName +
      "&units=imperial&appid=36be3a17aed933ccf53d10149b72f6fb",
    crossDomain: true,
  })
    .fail((err) => {
      // check if a bad request (95% of the time in this case it's cause the city is wrong)
      if (JSON.stringify(err).includes(404)) {
        alert(
          "Oops! We couldn't seem to locate that city. Please check your spelling or location and try again."
        );
      } else if (JSON.stringify(err).includes(429)) {
        // to many requests
        alert(
          "Oops! It seems too many data requests are coming from this application. Please wait a little while and try again."
        );
      } else {
        // other errors
        alert("Oops! It seems this application is experiencing an error.");
      }
    })
    .done((res) => {
      setCurrent(res);
      addSite(cityName);
      // call display recent function so it'll update when new search (if new city)
      displayRecent();
    });
}

// function to handle btn clicks
function recentClick(name) {
  callAPI(name);
}

// function to set recents in DOM
function displayRecent() {
  // get city objects from storage
  let cityNames = JSON.parse(localStorage.getItem("recentList")) || [];

  // clear list in DOM so we don't get duplicates
  $recentList.empty();

  // display each city name calling value from object
  cityNames.forEach((name) => {
    // create a btn in an li for each recent city with an onclick
    let cityItem = $(
      `<li><button onclick="recentClick('${name.cityName}')">${name.cityName}</button></li>`
    );
    $recentList.prepend(cityItem);
  });
}

// setting current weather
function setCurrent(data) {
  // setting date and location in DOM
  $currentMain.text(`${data.name} (${moment().format("MM[/]D[/]YYYY")})`);

  // api icon for current weather
  $currentMain.append(
    `<img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png" id="weather-icon" alt="weather-icon">`
  );

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
  setWeeklyWeather(data.coord.lat, data.coord.lon);
}

// function for setting UV index
function setUvIndex(lat, lon) {
  $.ajax({
    type: "GET",
    url:
      "https://api.openweathermap.org/data/2.5/uvi?lat=" +
      lat +
      "&lon=" +
      lon +
      "&appid=36be3a17aed933ccf53d10149b72f6fb",
  })
    .fail((err) => console.log(err))
    .done((res) => {
      // set DOM to uv index value from response when done
      $currentUvIndex.text(`UV Index: ${res.value}`);
    });
}

// function to set 5 day weather for current city
function setWeeklyWeather(lat, lon) {
  // ajax call to get 5 day weather
  $.ajax({
    type: "GET",
    url:
      "https://api.openweathermap.org/data/2.5/onecall?lat=" +
      lat +
      "&lon=" +
      lon +
      "&units=imperial&exclude=hourly,minutely,alerts,curent&appid=36be3a17aed933ccf53d10149b72f6fb",
  })
    .fail((err) => console.log(err))
    .done((res) => {
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
        let dayIconID = res.daily[i].weather[0].icon;
        let dayIconUrl = `https://openweathermap.org/img/w/${dayIconID}.png`;

        // set html elements using str templates to corrospond with day were referencing from api response since the ids and elements have same num, kinda cool
        $(`#day${i}-date`).text(dayDate);
        $(`#day${i}-img`).attr("src", dayIconUrl);
        $(`#day${i}-temp`).text(`Temp: ${dayTemp}`);
        $(`#day${i}-hum`).text(`Humidity: ${dayHum}`);
      }
    });
}

function addSite(cityName) {
  // getting array from local storage, or setting empty array
  let savedSites = JSON.parse(localStorage.getItem("recentList")) || [];
  let cityList = [];

  // push each value (actual name of city) to city list
  savedSites.forEach((city) => {
    cityList.push(city.cityName);
  });

  // if there is 10 elements being displayed already, get rid of last before adding new
  if (cityList.length >= 10) {
    savedSites.shift();
  }

  // check if the searched city name is already in our cityList
  if (!cityList.includes(cityName)) {
    // if searched city is not in list
    savedSites.push({ cityName });
    localStorage.setItem("recentList", JSON.stringify(savedSites));
  }
}
