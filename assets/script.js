const APIkey = "4d0369557b5d97102fb736c8b2d04288";
const $searchHistory = $('#search-history');
const searchCityInput = $("#search-city");
const searchCityButton = $("#search-city-button");
const clearHistoryButton = $("#clear-history");

const currentCity = $("#current-city");
const currentTemp = $("#current-temp");
const currentHumidity = $("#current-humidity");
const currentWindSpeed = $("#current-wind-speed");
const currentUV = $("#current-uv");
const weatherContent = $("#weather-content");
const currentDay = moment().format('L');

let cityList = [];

$(document).on("submit", function(event){
    event.preventDefault();
    const searchValue = searchCityInput.val().trim();
    currentWeather(searchValue)
    searchHistory(searchValue);
    searchCityInput.val(""); 
});
searchCityButton.on("click", function(event){
    event.preventDefault();
    const searchValue = searchCityInput.val().trim();
    currentWeather(searchValue)
    searchHistory(searchValue);    
    searchCityInput.val(""); 
});

clearHistoryButton.on("click", function(){
    cityList = [];
    listArr();
});

$searchHistory.on("click","li.city-btn", function() {
    var value = $(this).data("value");
    currentWeather(value);
    searchHistory(value); 
});

function currentWeather(searchValue) {
    const requestURL = `https://api.openweathermap.org/data/2.5/weather?q=`+searchValue+`&units=imperial&appid=${APIkey}`;

    $.ajax({
        url: requestURL,
        method: "GET"
    }).then(function(response){
        currentCity.text(response.name);
        currentCity.append("<small class='text-muted' id='current-date'>");
        $("#current-date").text("("+ currentDay +")");
        currentCity.append("<img src='https://openweathermap.org/img/w/" + response.weather[0].icon + ".png' alt='" + response.weather[0].main + "' />" )
        currentTemp.text(response.main.temp + " F");
        currentHumidity.text(response.main.humidity + "%");
        currentWindSpeed.text(response.wind.speed + " MPH");
        
        let lat = response.coord.lat;
        let long = response.coord.lon;
        
        const uvURL = `https://api.openweathermap.org/data/2.5/uvi?&lat=`+lat+`&lon=`+long+`&appid=${APIkey}`;

        $.ajax({
            url: uvURL,
            method: "GET"
        }).then(function(response){
            currentUV.text(response.value);
        });
        // 
        const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?&units=imperial&appid=${APIkey}&lat=`+lat+`&lon=`+long;
        
        $.ajax({
            url: forecastURL,
            method: "GET"
        }).then(function(response){
            $('#five-day-forecast').empty();
            for (let i = 1; i < response.list.length; i+=8) {
                
                const forecastDateString = moment(response.list[i].dt_txt).format("L");
                const forecastCol = $("<div class='col-12 col-md-6 col-lg forecast-day mb-3'>");
                const forecastCard = $("<div class='card'>");
                const forecastCardBody = $("<div class='card-body'>");
                const forecastDate = $("<h5 class='card-title'>");
                const forecastIcon = $("<img>");
                const forecastTemp = $("<p class='card-text mb-0'>");
                const forecastHumidity = $("<p class='card-text mb-0'>");
                const forecastWind = $("<p class='card-text mb-0'>");
                
                $('#five-day-forecast').append(forecastCol);
                forecastCol.append(forecastCard);
                forecastCard.append(forecastCardBody);

                forecastCardBody.append(forecastDate);
                forecastCardBody.append(forecastIcon);
                forecastCardBody.append(forecastTemp);
                forecastCardBody.append(forecastWind);
                forecastCardBody.append(forecastHumidity);
                
                forecastIcon.attr("src", "https://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png");
                forecastIcon.attr("alt", response.list[i].weather[0].main)
                forecastDate.text(forecastDateString);
                forecastTemp.text(response.list[i].main.temp);
                forecastTemp.prepend("Temp: ");
                forecastTemp.append(" &deg;F");
                forecastWind.text(response.list[i].wind.speed);
                forecastWind.prepend("Wind: ");
                forecastWind.append(" MPH");
                forecastHumidity.text(response.list[i].main.humidity);
                forecastHumidity.prepend("Humidity: ");
                forecastHumidity.append("%");
            }
        }); 
    });
    
};
function searchHistory(searchValue) {
    if (searchValue) {
        if (cityList.indexOf(searchValue) === -1) {
            cityList.push(searchValue);
            listArr();
            clearHistoryButton;
            weatherContent;
        } else {
            const removeIndex = cityList.indexOf(searchValue);
            cityList.splice(removeIndex, 1);
            cityList.push(searchValue);
            listArr();
            clearHistoryButton;
            weatherContent;
        }
    }
}
function listArr() {
    $searchHistory.empty();
    cityList.forEach(function(city){
        const searchHistoryItem = $('<li class="list-group-item city-btn">');
        searchHistoryItem.attr("data-value", city);
        searchHistoryItem.text(city);
        $searchHistory.prepend(searchHistoryItem);
    });
    localStorage.setItem("cities", JSON.stringify(cityList));
    
}
function initHistory() {
    if (localStorage.getItem("cities")) {
        cityList = JSON.parse(localStorage.getItem("cities"));
        let lastIndex = cityList.length - 1;
        listArr();
        if (cityList.length !== 0) {
            currentWeather(cityList[lastIndex]);
            weatherContent.removeClass("hide");
        }
    }
}
initHistory();