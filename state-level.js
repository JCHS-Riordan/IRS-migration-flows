/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~ https://api.highcharts.com/highmaps/ ~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
var states = Highcharts.geojson(Highcharts.maps['countries/us/states'])
var logoURL = 'http://www.jchs.harvard.edu/sites/jchs.harvard.edu/files/harvard_jchs_logo_2017.png'

var map = {}
var ageGroupChart = {}
var timeSeriesChart = {}

var ref_data = []
var data = []

var selected_year = "2016"
var selected_age_idx = 10

var map_legend_stops = [
  [0.1, '#AF3C31'],
  [0.47, '#E87171'],
  [0.5, '#fff'],
  [0.505, '#D7F3F0'],
  [0.9, '#1E328E']
]

var line_chart_zones = [
  {
    value: -15000,
    color: '#AF3C31'
  }, {
    value: 0,
    color: '#E87171'
  }, {
    value: 15000,
    color: '#68CBC0'
  }, {
    color: '#4E7686'
  }
]

var column_chart_zones = [
  {
    value: 0,
    color: '#AF3C31'
  }, {
    color: '#4E7686' 
  },
]

Highcharts.setOptions({
  colors: ['#4E7686', '#998b7d', '#c14d00', '#43273a', '#e9c002', '#76ad99', '#c4c6a6'],
  subtitle: { text: null },
  credits: { enabled: false },
  exporting: { enabled: false },
  lang: { thousandsSep: "," }
}) //end standard options

$(document).ready(function() {
  //Google Sheet API request
  var SheetID = '1olDiyrqpAmQ0KLkyZlFnfXOl61Ri-lCpE0QG-6585L4' 
  /*Includes all years: 17F6y8EbXSKf4iTsWnw1rqNWDUZqh2jYX0hFP8MkVndI 
  versus all years except 2015, plus 2012-2016 (no 2015) average: 
  1olDiyrqpAmQ0KLkyZlFnfXOl61Ri-lCpE0QG-6585L4 */
  var range = 'Sheet1!A:Q'
  var baseURL = 'https://sheets.googleapis.com/v4/spreadsheets/'
  var API_Key = 'AIzaSyDY_gHLV0A7liVYq64RxH7f7IYUKF15sOQ'
  var API_params = 'valueRenderOption=UNFORMATTED_VALUE'
  var requestURL = baseURL + SheetID + '/values/' + range + '?key=' + API_Key + '&' + API_params

  $.get(requestURL, function(obj) {
    console.log(requestURL)

    ref_data = obj.values
    console.log(ref_data[0]) //column headers

    data = ref_data
      .filter(function (x) { return x[0] === 2016 })
      .map(function (val) {
      return [val[1],val[10]]
    })

    $('.year_label').html(data[0][1])

    createMap()
    
  }) //end get request
}) //end document.ready

function createMap() {

  // Create the chart 
  map = Highcharts.mapChart('state_migration_map', {
    chart: {
      margin: [35, 0, 60, 0],
      spacingTop: 0,
      borderWidth: 0,
      events: {
        load: function() {
          this.renderer.image(logoURL, this.chartWidth-204, this.chartHeight-58, 221 ,65).add()
        },
      },
    },

    title: {
      text: 'Domestic Migration: Net Flows<br/><span style="font-size: 15px;">' + $('#select_age :selected').html() + ', 2016' + '</span>',
      style: {
        color: '#C14D00',
        fontWeight: 600,
        fontSize: '19px'
      }
    },

    legend: {
      title: {
        text: 'Net flow of individuals'  
      },
      layout: 'horizontal',
      align: 'left',
      verticalAlign: 'bottom',
      y: 23,
      symbolWidth: 280,
      backgroundColor: 'rgba(255, 255, 255, 0.0)',
    },

    mapNavigation: { 
      enabled: true,
      buttonOptions: {
        align: 'right',
        verticalAlign: 'bottom',
        width: 8,
        height: 13,
        style: {
          fontSize: '12px'
        }
      },
      buttons: {
        zoomIn: {
          y: 35
        },
        zoomOut: {
          y: 35,
          x: -18
        }
      }
    },

    colorAxis: {
      type: 'linear',
      stops: map_legend_stops,
      min: -200000,
      max: 200000,
    },

    series: [{
      type: 'map',
      name: 'Net Flows',
      mapData: states,
      allAreas: true,
      allowPointSelect: true,
      states: {
        hover: {color: '#888'},
        select: { color: '#222' } //highlights selected county
      },
      data: data,
      joinBy: ['GEOID', 0],
      keys: ['GEOID', 'value'],
      borderWidth: 1,
      borderColor: '#eee',
      point: {
        events: {
          select: function (event) {
            console.log('clicked on map: ' + event.target.name)

            if (event.accumulate == false) {
              drilldownState(event.target.GEOID, event.target.name)

            } else if (map.getSelectedPoints().length === 1) {
              addState(event.target.GEOID, event.target.name)

            } else if (map.getSelectedPoints().length > 1) {
              clearSelection()
              map.series[0].data[map.getSelectedPoints()[0].index].select(false)
              
            } //end if

          } //end event.select
        } // end events
      } //end point
    }], //end series

    tooltip: {
      useHTML: true,
      padding: 1,
      backgroundColor: 'rgba(247,247,247,1)'
    }, //end tooltip

  }) //end Hicharts.mapChart
} //end createMap()


/*~~~~~~~~ Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
function drilldownState (GEOID, state_name) {
  $('#drilldown_title').html(state_name + ', ' + selected_year)

  var chart_data = []
  var line_data = []

  ref_data.forEach(function (el) {
    if (el[1] == GEOID) {
      if (el[0] == selected_year) {
        el.slice(11,17).map(function (x) {
          chart_data.push(x)
        })
      } //end if
      line_data.push( {y: el[selected_age_idx], x: el[0]} )
    } //end if
  }) //end forEach

  ageGroupChart = Highcharts.chart('age_group_chart', {
    chart: {
      type: 'column',
      spacingTop: 0,
      marginTop: 15,
      spacingBottom: 0,
      spacingRight: 11,
      marginLeft: 50,
      borderWidth: 0
    },

    xAxis: {
      categories: ['<26', '26-34', '35-44', '45-54', '55-64', '65+'],
      labels: { overflow: false },
      tickInterval: 1,
      tickLength: 0,
    },

    series: [{
      name: 'Net Flow',
      data: chart_data,
      zones: column_chart_zones,
      GEOID: GEOID,
      state_name: state_name
    }], //end series

    title: { text: null },
    yAxis: { title: { text: null } },
    legend: { enabled: false },
  }) //end column chart


  timeSeriesChart = Highcharts.chart('time_series_chart', {
    chart: {
      type: 'line',
      spacingTop: 0,
      marginTop: 25,
      spacingBottom: -3,
      spacingRight: 11,
      marginLeft: 50,
      borderWidth: 0
    },

    xAxis: {
      labels: { overflow: false },
      tickInterval: 2,
      tickLength: 0
    },

    series: [{
      name: 'Net Flow' 
        + '<br/><span style="font-size: 10px; font-weight: normal;">' 
        + $('#select_age :selected').html() 
        + '</span>',
      data: line_data,
      color: '#555', //label color
      zones: line_chart_zones,
      GEOID: GEOID,
      state_name: state_name
    }], //end series

    title: { text: null },
    yAxis: { title: { text: null } },
    legend: { enabled: false },
  }) //end line chart

  //add button to clear the selection
  if (!$('#clear_button').length) {
    map.renderer.button('Clear<br />selection',440,255)
      .attr({
      padding: 3,
      id: 'clear_button'
    }).add()

    $('#clear_button').click(clearSelection)
  }

} // end drilldownState()


function clearSelection () {
  if (map.getSelectedPoints().length > 0) {
    map.getSelectedPoints().forEach(function (x) {
      map.series[0].data[x.index].select(false)
    })
  }
  
  $('#clear_button').remove()
  $('#drilldown_title').html('')
  $('#age_group_chart').append('<h4 class="map-instructions">Click on a state to see age groups<br>and change over time  ➞<br><span id="sub_instructions">(Ctrl+click to select a comparison state)</span></h4>')

  timeSeriesChart.destroy()
  ageGroupChart.destroy()
}


function addState(GEOID, state_name) {
  //add state to drilldown charts
  var chart_data = []
  var line_data = []

  ref_data.forEach(function (el) {
    if (el[1] == GEOID) {
      if (el[0] == selected_year) {
        el.slice(11,17).map(function (x) {
          chart_data.push(x)
        })
      } //end if
      line_data.push( {y: el[selected_age_idx], x: el[0]} )

    } //end if
  }) //end forEach
  
  timeSeriesChart.addSeries({
    data: line_data, 
    name: state_name,
    color: '#333', //label color
    zones: line_chart_zones,
    GEOID: GEOID,
    state_name: state_name
  })
  timeSeriesChart.series[0].update({label: {enabled: false}})
  timeSeriesChart.update({
    credits: {
      enabled: true, 
      text: 'Net Flows: ' + $('#select_age :selected').html(),
      position: { 
        verticalAlign: 'top',
        y: 21
      }
    }
  }, false)
  timeSeriesChart.series[0].update({
    name: timeSeriesChart.series[0].options.state_name, 
    label: { enabled: true}
  })

  ageGroupChart.addSeries({
    data: chart_data, 
    name: state_name,
    GEOID: GEOID,
    state_name: state_name
  })
  ageGroupChart.update({
    legend: {
      enabled: true, 
      margin: 5,
      padding: 0,
      maxHeight: 16
    }
  })
  ageGroupChart.series[0].update({
    name: timeSeriesChart.series[0].options.state_name,
    //color: '#a4b',
    zones: null
  })

  $('#drilldown_title').html(selected_year)

} //end addState()


function changeMap () {
  var new_map_data = []

  ref_data
    .filter(function (x) { return x[0] == selected_year })
    .forEach(function (val) {
    new_map_data.push([val[1],val[selected_age_idx]])
  })

  map.series[0].setData(new_map_data)
  map.title.update({text: 'Domestic Migration: Net Flows<br/><span style="font-size: 15px;">' +  $('#select_age :selected').html() + ', ' + selected_year + '</span>' })

  $('#year_label').html(selected_year)
  
} //end changeMapData()


function changeLineChart () {
  var new_line_data = [[],[]]

  ref_data.forEach(function (el) {
    timeSeriesChart.series.forEach(function (x, idx) {
      if (el[1] == x.options.GEOID) {
        new_line_data[idx].push( {y: el[selected_age_idx], x: el[0]} )
      }  
    }) //end if
  }) //end forEach

  if (timeSeriesChart.series.length === 1) {
    timeSeriesChart.series[0].update({label: {enabled: false}})
    timeSeriesChart.series[0].update({
      name: 'Net Flow' 
      + '<br/><span style="font-size: 10px; font-weight: normal;">' 
      + $('#select_age :selected').html() 
      + '</span>', 
      label: {enabled: true}
    })
    timeSeriesChart.series[0].setData(new_line_data[0])
  } else {
    timeSeriesChart.series[0].setData(new_line_data[0])
    timeSeriesChart.series[1].setData(new_line_data[1])
    timeSeriesChart.update({ credits: {text: 'Net Flows: ' + $('#select_age :selected').html()} })
  } //end if
  
} //end changeLineChart()


function changeColumnChart () {
  var new_chart_data = [[],[]]

  ref_data.forEach(function (el) {
    ageGroupChart.series.forEach(function (x, idx) {
      if (el[1] == x.options.GEOID) {
        if (el[0] == selected_year) {
          el.slice(11,17).map(function (x) { new_chart_data[idx].push(x) })
        } //end if
      } //end if  
    }) //end if
  }) //end forEach

  if (ageGroupChart.series.length === 1) {
    ageGroupChart.series[0].setData(new_chart_data[0])
    $('#drilldown_title').html(map.getSelectedPoints()[0].name + ', ' + selected_year)
  } else {
    ageGroupChart.series[0].setData(new_chart_data[0])
    ageGroupChart.series[1].setData(new_chart_data[1])
    $('#drilldown_title').html(selected_year)
  } //end if

} //end changeColumnChart()


/*~~~~~~~~ User interaction ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
$('#select_age').on('change', function () {
  selected_age_idx = $('#select_age').val()
  if (selected_age_idx != 10) {
    map.update({colorAxis: {min: -40000, max: 40000}})
  } else {
    map.update({colorAxis: {min: -200000, max: 200000}})
  }
  changeMap()
  changeLineChart()
})

$('#year_slider').on('change', function () {
  //selected_year = $('#year_slider').val()
  var slider_val = $('#year_slider').val()
  if (slider_val == 1) {selected_year = '2012'}
  if (slider_val == 2) {selected_year = '2013'}
  if (slider_val == 3) {selected_year = '2014'}
  if (slider_val == 4) {selected_year = '2016'}

  changeMap()
  changeColumnChart()
})

$('#year_slider').on('mousedown mouseup', function () {
  $('#year_label').toggleClass('hidden')
});

//for cross-browser compatibility on slider drag
$("#year_slider").on('input', function () {
  $(this).trigger('change');
});
