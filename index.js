var city = 'taipei';
var APIKey = '32ddd49f1610741a56a016a61d52c611';
var my_ctx_temp;
var my_ctx_rain;



async function upgradeCurrentData() {
    var APIUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}&units=metric`;
    const response = await fetch(APIUrl);
    var data = await response.json();
    // var data = {"coord":{"lon":121.5319,"lat":25.0478},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"base":"stations","main":{"temp":17.12,"feels_like":16.92,"temp_min":15.85,"temp_max":17.53,"pressure":1020,"humidity":78},"visibility":10000,"wind":{"speed":8.75,"deg":80},"clouds":{"all":75},"dt":1707120556,"sys":{"type":2,"id":266033,"country":"TW","sunrise":1707086108,"sunset":1707126026},"timezone":28800,"id":1668341,"name":"Taipei","cod":200};

    // console.log(response);
    // console.log(data);

    // change HTML DOM data
    // current
    document.getElementById("location").innerText = data['name'];

    var rain = (data.hasOwnProperty('rain')? data['rain']['1h']: '0');
    // console.log(rain)
    document.getElementById("current_rain_pop").innerHTML = `<i class="fa-solid fa-umbrella"></i> : ${rain} mm/hour`;

    document.getElementById("current_temp").innerHTML = `${Math.round(data['main']['temp'])}&deg;`;
    document.getElementById("current_temp_min_max").innerHTML = `${Math.round(data['main']['temp_min'])} ~ ${Math.round(data['main']['temp_max'])} (&deg;c)`

    document.getElementById("current_icon").src = 'https://openweathermap.org/img/wn/'+data['weather']['0']['icon']+'@2x.png';

    var mode = data['weather']['0']['icon'].slice(2, 3);
    // console.log('upgrade')
    // console.log(city);
    // console.log('https://openweathermap.org/img/wn/'+data['weather']['0']['icon']+'@2x.png');
    // console.log(mode);
    if (mode == 'n') {
        document.documentElement.style.setProperty('--color-l-1', '#FFEAD2');
        document.documentElement.style.setProperty('--color-l-2', '#DBDFEA');
        document.documentElement.style.setProperty('--color-l-3', '#ACB1D6');
        document.documentElement.style.setProperty('--color-l-4', '#8294C4');
        document.documentElement.style.setProperty('--color-bg-search', '#FFB996');
        document.documentElement.style.setProperty('--color-font-search', '#002B5B');
    }
    else {
        document.documentElement.style.setProperty('--color-l-1', '#FDFFAB');
        document.documentElement.style.setProperty('--color-l-2', '#FFCF81');
        document.documentElement.style.setProperty('--color-l-3', '#FFB996');
        document.documentElement.style.setProperty('--color-l-4', '#D9EDBF');
        document.documentElement.style.setProperty('--color-bg-search', '#002B5B');
        document.documentElement.style.setProperty('--color-font-search', '#FFB996');
    }

}

async function upgradeForecasrData() {
    var APIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIKey}&units=metric`;
    const response = await fetch(APIUrl);
    var data = await response.json();

    
    // console.log(data);


    // 24 hour forecast
    var data_temp = [];
    var labels_temp = [];
    var data_rain = [];
    var labels_rain = [];

    for (i=0; i<8; i++) {
        data_temp.push(data['list'][i]['main']['temp']);
        labels_temp.push(data['list'][i]['dt_txt'].slice(11, 16));
        data_rain.push(data['list'][i]['pop']*100);
        labels_rain.push(data['list'][i]['dt_txt'].slice(11, 16));
    }

    // console.log(typeof(my_ctx_temp));
    if (my_ctx_temp != undefined) {
        my_ctx_temp.destroy();
    }

    var ctx_temp = document.getElementById('forecast_hour_temp_graph');

    my_ctx_temp = new Chart(ctx_temp, {
    type: 'line',
    data: {
        labels: labels_temp,
        datasets: [{
        label: 'Temperature',
        data: data_temp,
        borderColor: 'rgb(211, 84, 0)',
        backgroundColor: 'rgba(211, 84, 0, 0.5)',
        color: 'black',
        borderWidth: 1
        }]
    },
    options: {
        aspectRatio:4,
        plugins: {
          legend: {
            display: false
          }
        }
    }
    });
    // console.log(typeof(my_ctx_temp));

    var ctx_rain = document.getElementById('forecast_hour_rain_graph');

    if (my_ctx_rain != undefined) {
        my_ctx_rain.destroy();
    }
    my_ctx_rain = new Chart(ctx_rain, {
    type: 'bar',
    data: {
        labels: labels_rain,
        datasets: [{
        label: 'Rain',
        data: data_rain,
        borderColor: 'rgb(41, 128, 185)',
        backgroundColor: 'rgba(41, 128, 185, 0.5)',
        borderWidth: 1
        }]
    },
    options: {
        aspectRatio:4,
        plugins: {
          legend: {
            display: false
          }
        }
    }
    });

    // 5 days forecast
    var weekdays = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'];
    var daysForecast = {};
    for (i=0; i<40; i++) {
        var d = data['list'][i]['dt_txt'].slice(0, 11);
        if (daysForecast.hasOwnProperty(d)) {
            daysForecast[d]['temp_min'].push(data['list'][i]['main']['temp_min']);
            daysForecast[d]['temp_max'].push(data['list'][i]['main']['temp_max']);
            daysForecast[d]['weather'].push(data['list'][i]['weather'][0]['main']);
            daysForecast[d]['icon'].push(data['list'][i]['weather'][0]['icon']);
        }
        else {
            daysForecast[d] = {};
            daysForecast[d]['temp_min'] = [data['list'][i]['main']['temp_min']];
            daysForecast[d]['temp_max'] = [data['list'][i]['main']['temp_max']];
            daysForecast[d]['weather'] = [data['list'][i]['weather'][0]['main']];
            daysForecast[d]['icon'] = [data['list'][i]['weather'][0]['icon']];
        }
    }
    // console.log(daysForecast);
    // console.log(Object.keys(daysForecast)[1]);
    var daysForecastHTML = ['', 'one', 'two', 'three', 'four', 'five'];
    for (i=1; i<6; i++) {
        var k = Object.keys(daysForecast)[i];
        var d = new Date(k);
        
        var htmlTag = daysForecastHTML[i];
        document.getElementById(`week_${htmlTag}`).innerHTML = weekdays[d.getDay()];
        document.getElementById(`forecast_icon_${htmlTag}`).src = 'https://openweathermap.org/img/wn/'+daysForecast[k]['icon'][0]+'@2x.png';
        document.getElementById(`desc_${htmlTag}`).innerHTML = daysForecast[k]['weather'][0];
        document.getElementById(`temp_range_${htmlTag}`).innerHTML = `${Math.round(Math.min(...daysForecast[k]['temp_min']))} ~ ${Math.round(Math.max(...daysForecast[k]['temp_max']))} (&deg;c)`;
    }
}

function search() {
    city = document.getElementById('search').value;
    upgradeCurrentData();
    upgradeForecasrData();
}

document.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      search();
    }
  });

  