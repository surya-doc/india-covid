const { json } = require('body-parser');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const https = require('https');
const _ = require('lodash');
const app = express();
var request = require('request');
const { isObject } = require('util');


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

var reqTitle = "";
var optionsDistrictWise = {
  'method': 'GET',
  'url': "https://api.covid19india.org/v4/data.json",
  'headers': {
  }
};

var disArr = [];
var indianArr = [];
request(optionsDistrictWise, function (error, response) {
    if (error) throw new Error(error);
    var sh = JSON.parse(response.body);
    for(var val in sh) {
      
      var state = {
        stateCode: "",
        confirmed: "",
        deceased: "",
        recovered: "",
        tested: "",
        stateName: "",
        dis: []
      }
      state.stateCode = val;
        for(var tot in sh[val]) {
          if(tot === 'total'){
            state.confirmed = sh[val][tot]['confirmed'].toLocaleString();
            // console.log(state.confirmed);
            state.deceased = Number(sh[val][tot]['deceased']).toLocaleString();
            state.recovered = Number(sh[val][tot]['recovered']).toLocaleString();
            state.tested = Number(sh[val][tot]['tested']).toLocaleString();
          }
          if(tot === 'districts'){

            for(var disName in sh[val][tot]){
              var district = {
                districtName: "",
                disConfirmed: "",
                disDeceased: "",
                disRecovered: ""
              }

              district.districtName = disName;
              for(var disData in sh[val][tot][disName]){
                if(disData === 'total'){
                  var info = sh[val][tot][disName][disData];
                  district.disConfirmed = Number(info['confirmed']).toLocaleString();
                  district.disDeceased = Number(info['deceased']).toLocaleString();
                  district.disRecovered = Number(info['recovered']).toLocaleString();
                }
              }

              state.dis.push(district);

            }

          }
        }
      
      disArr.push(state);
    }

});


var updatedTime = "";
var request = require('request');
var optionsStateWise = {
  'method': 'GET',
  'url': 'https://api.covid19india.org/data.json',
  'headers': {
  }
};
request(optionsStateWise, function (error, response) {
  if (error) throw new Error(error);
  const stateData = JSON.parse(response.body);
  updatedTime = stateData.statewise[0].lastupdatedtime;
  for(var val in stateData){
      if(val === 'statewise'){
          for(var stateName in stateData[val]){
            for(var i=0; i < disArr.length; i++){
              if(stateData[val][stateName]['statecode'] === disArr[i].stateCode){
                disArr[i].stateName = stateData[val][stateName]['state'];
              }
            }
          }
      }
      console.log(updatedTime);
  }

  var indianData = {
    inActive: "",
    inConfirmed: "",
    inDeaths: "",
    inRecovered: ""
  }

  indianData.inActive = Number(stateData.statewise[0].active).toLocaleString();
  indianData.inConfirmed = Number(stateData.statewise[0].confirmed).toLocaleString();
  indianData.inDeaths = Number(stateData.statewise[0].deaths).toLocaleString();
  indianData.inRecovered = Number(stateData.statewise[0].recovered).toLocaleString();

  indianArr.push(indianData);

});


app.get('/', (req, res) => {
  res.render('home', {time: updatedTime, arr: disArr, indiArr: indianArr});
})

app.post('/', (req, res) => {
  reqTitle = req.body.srch;
  res.redirect('/district/'+reqTitle);
})

app.get('/district/:disname', (req, res) => {
  reqTitle = _.lowerCase(req.params.disname);
  for(var j=0; j < disArr.length; j++){
    if((_.lowerCase(disArr[j].stateName)) === reqTitle){
      res.render('district-wise', {state: disArr[j], arr: disArr[j].dis});
    }

  }
})


app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running at port 3000');
})