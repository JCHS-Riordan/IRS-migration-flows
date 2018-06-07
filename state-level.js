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

var selected_year = "2012-2016 Average"
var selected_age_idx = 12

var map_legend_stops = [
  [0.1, '#c14d00'],
  [0.48, '#eab700'],
  [0.5, '#eee'],
  [0.52, '#b8d4ca'],
  [0.9, '#467b91']
]

var map_legend_zones = [
 {
   to: -10000,
 },
 {
   from: -10000,
   to: -1000,
 },
  {
    from: -1000,
    to: 0,
  },
  {
  from: 0,
    to: 1000,
  },
 {
   from: 1000,
   to: 10000,
 },
  {
    from: 10000,
  }
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
      .filter(function (x) { return x[0] === selected_year })
      .map(function (val) {
      return [val[1],val[12]]
    })

    $('.year_label').html(data[0][1])

    createMap()
    
  }) //end get request
}) //end document.ready

function createMap() {

  // Create the chart 
  map = Highcharts.mapChart('state_migration_map', {
    chart: {
      margin: [35, 0, 100, 0],
      spacingTop: 0,
      borderWidth: 0,
      events: {
        load: function() {
          this.renderer
            .image(logoURL, 0, this.chartHeight-57, 210, 62)
            .add()
          
          autoMap()
        },
      },
    },

    title: {
      text: '<span style="font-size: 15px;">' + 'Domestic Migration Across States by Age: ' + $('#select_age :selected').html() + '</span>' + '<br/><span style="font-size: 14px;">' + selected_year + '</span>',
      style: {
        color: '#C14D00',
        fontWeight: 600,
        fontSize: '19px'
      }
    },

    legend: {
      title: {
        text: 'Annual Net Domestic Migration'  
      },
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      y: -40,
      symbolWidth: 280,
      backgroundColor: 'rgba(255, 255, 255, 0.0)',
    },

          subtitle: {
        //use subtitle element for our table notes
            text:
            "Notes: 2015 data are excluded from the map, line chart, and 2012-2016 average due to data quality issues. Data shown are number of exemptions claimed, approximating individuals. These data do not measure, and therefore do not show, international immigration. <br/>Source: JCHS tabulations of IRS, Statistics of Income Migration Data.",
        widthAdjust: -180,
        align: "left",
        x: 190,
        y: -35, //may have to change this, depending on length of notes
        verticalAlign: "bottom",
        style: {
          color: "#999999",
          fontSize: "9px"
        }
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
     // dataClasses: map_legend_zones,
      min: -40000,
      max: 40000,
    },

    series: [{
      type: 'map',
      name: 'Net Flows',
      mapData: states,
      allAreas: true,
      allowPointSelect: true,
      states: {
        hover: {color: '#888'},
        select: { color: '#222' } //highlights selected state
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
            var points = map.getSelectedPoints()
            if (event.accumulate == false) {
              drilldownState(event.target.GEOID, event.target.name)

            } else if (points.length === 1) {
              addState(event.target.GEOID, event.target.name)

            } else if (points.length > 1) {
              clearSelection()
              map.series[0].data[points[0].index].select(false)

            } //end if
          } //end event.select
        } // end events
      } //end point
    }], //end series

    tooltip: {
      useHTML: true,
      padding: 1,
      backgroundColor: 'rgba(247,247,247,1)',
      valueDecimals: 0
    }, //end tooltip

       /*~~~~~~Exporting options~~~~~~*/
    exporting: {
      enabled: true,
      filename: "Domestic Migration - " + $('#select_age :selected').html() + ', ' + selected_year,
      menuItemDefinitions: {
        /*downloadFullData: {
          text: 'Download full dataset (Excel)',
          onclick: function () {
            window.open('http://www.jchs.harvard.edu/')
            alert('See tab A-1 for data from this chart')
          }
        },*/
        viewSortableTable: {
          text: 'View full dataset',
          onclick: function () {
            window.open('https://codepen.io/JCHS-Riordan/full/RyzWRO')
          }
        }
      },
      buttons: {
        contextButton: {
          text: 'Export',
          menuItems: [
            'viewSortableTable',
            'separator',
            'printChart',
            'downloadPDF',
            'separator',
            'downloadPNG',
            'downloadJPEG',
            //'separator',
            //'downloadFullData'
          ],
          theme: {
            fill: '#ffffff00'
          },
          y: 30,
          x: 10
        }
      }
    } //end exporting
    
  }) //end Hicharts.mapChart
} //end createMap()


/*~~~~~~~~ Functions ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
function drilldownState (GEOID, state_name) {
  //$('#drilldown_title').html(state_name + ', ' + selected_year) //Removing b/c subtitles added 

  var chart_data = []
  var line_data = []

  ref_data.forEach(function (el) {
    if (el[1] == GEOID) {
      if (el[0] == selected_year) {
        el.slice(11,17).map(function (x) {
          chart_data.push(x)
        })
      } //end if
      if(el[0] != '2012-2016 Average') {
        line_data.push( {y: el[selected_age_idx], x: el[0]} )
      }
    } //end if
  }) //end forEach

  ageGroupChart = Highcharts.chart('age_group_chart', {
    chart: {
      type: 'column',
      spacingTop: 10,
      marginTop: 45,
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
      title: {
        text: state_name,
        style: {
          fontWeight: 'bold'
        }
      }
    },

    series: [{
      name: 'Net Flow',
      data: chart_data,
      zones: column_chart_zones,
      GEOID: GEOID,
      state_name: state_name
    }], //end series

    tooltip: {
      valueDecimals: 0  
    }, 
    
    title: { 
      text: 'Net Flows by Age<br/>' + selected_year,
      style: {
        fontSize: 14
      }
    },
    yAxis: { title: { text: null } },
    legend: { enabled: false },
  }) //end column chart


  timeSeriesChart = Highcharts.chart('time_series_chart', {
    chart: {
      type: 'line',
      spacingTop: 10,
      marginTop: 45,
      spacingBottom: -3,
      spacingRight: 11,
      marginLeft: 50,
      marginBottom: 25,
      borderWidth: 0
    },

    xAxis: {
      labels: { overflow: false },
      tickInterval: 2,
      tickLength: 0
    },

    series: [{
      name: state_name,
      data: line_data,
      color: '#555', //label color
      zones: line_chart_zones,
      GEOID: GEOID,
      state_name: state_name
    }], //end series

    title: { 
      text: 'Net Flows Over Time<br/>' + $('#select_age :selected').html(),
      style: {
        fontSize: 14
      }
    },
    yAxis: { title: { text: null } },
    legend: { enabled: false },
  }) //end line chart

  //add button to clear the selection
  if (!$('#clear_button').length) {
    map.renderer.button('Clear<br />selection',440,255)
      .attr({
      padding: 3,
      id: 'clear_button',
      zIndex: 4,
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
  //$('#drilldown_title').html('')  Removing b/c subtitles added
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
      if(el[0] != '2012-2016 Average') {
        line_data.push( {y: el[selected_age_idx], x: el[0]} )
      }
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
      enabled: false, 
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
    },
    xAxis: {
      title: {
        text: null
      }
    }
  })
  ageGroupChart.series[0].update({
    name: timeSeriesChart.series[0].options.state_name,
    //color: '#a4b',
    zones: null
  })

  //$('#drilldown_title').html(selected_year)  Removing b/c subtitles added

} //end addState()


function changeMap () {
  var new_map_data = []

  ref_data
    .filter(function (x) { return x[0] == selected_year })
    .forEach(function (val) {
    new_map_data.push([val[1],val[selected_age_idx]])
  })
var selected_age = $('#select_age :selected').html()
map.series[0].setData(new_map_data)
  map.title.update({text: 
    `<span style="font-size: 15px;">
    Domestic Migration Across States by Age: ${selected_age}</span>
    <br/>
    <span style="font-size: 14px;">${selected_year}</span>`
  })

  $('#year_label').html(selected_year)
  
} //end changeMapData()


function changeLineChart () {
  if (typeof timeSeriesChart.series == 'undefined') {return}
  var new_line_data = [[],[]]

  ref_data.forEach(function (el) {
    timeSeriesChart.series.forEach(function (x, idx) {
      if (el[1] == x.options.GEOID & el[0] != '2012-2016 Average') {
          new_line_data[idx].push( {y: el[selected_age_idx], x: el[0]} )
      }  
    }) //end if
  }) //end forEach

  if (timeSeriesChart.series.length === 1) {
    timeSeriesChart.series[0].setData(new_line_data[0])
  } else {
    timeSeriesChart.series[0].setData(new_line_data[0])
    timeSeriesChart.series[1].setData(new_line_data[1])
  } //end if
  timeSeriesChart.update({ title: {text: '<span style="font-size: 14px;"> Net Flows Over Time<br/>' + $('#select_age :selected').html() + '</span>'} })
} //end changeLineChart()


function changeColumnChart () {
  if (typeof ageGroupChart.series == 'undefined') {return}
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
    //$('#drilldown_title').html(map.getSelectedPoints()[0].name + ', ' + selected_year)
  } else {
    ageGroupChart.series[0].setData(new_chart_data[0])
    ageGroupChart.series[1].setData(new_chart_data[1])
    //$('#drilldown_title').html(selected_year)
  } //end if
  ageGroupChart.update({ title: {text: '<span style="font-size: 14px;"> Net Flows by Age <br/> ' + selected_year + '</span>'} })
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
  if (slider_val == 5) {selected_year = '2012-2016 Average'}

  changeMap()
  changeColumnChart()
})
/* NOTE: DM wants the year to be always visible, commenting this out -RF
$('#year_slider').on('mousedown mouseup', function () {
  $('#year_label').toggleClass('hidden')
});
*/
//for cross-browser compatibility on slider drag
$("#year_slider").on('input', function () {
  $(this).trigger('change');
});

$('#year_slider').click(() => clearInterval(autoMapLoop))

var count = 0
var yearsInAnimation = [1,2,3,4]
var interval = 1250

function runChange () {
  if (count == yearsInAnimation.length) { count = 0 }
  $('#year_slider').val(yearsInAnimation[count])
  $('#year_slider').trigger('change')
  count++
}

function autoMap () {
  autoMapLoop = setInterval(runChange, interval)
}
