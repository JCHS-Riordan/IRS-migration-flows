/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~ https://api.highcharts.com/highmaps/ ~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
cbsas = Highcharts.geojson(Highcharts.maps['countries/us/cbsa'])
states = Highcharts.geojson(Highcharts.maps['countries/us/states'])
logoURL = 'http://www.jchs.harvard.edu/sites/jchs.harvard.edu/files/harvard_jchs_logo_2017.png'

var ref_data = []
var data = []
var categories = []
var selected_year = "2016"
var selected_age_idx = 10

$(document).ready(function() {
  createMap()
})

function createMap() {
  //Google Sheet API request
  SheetID = '17F6y8EbXSKf4iTsWnw1rqNWDUZqh2jYX0hFP8MkVndI'
  range = 'Sheet1!A:Q'
  baseURL = 'https://sheets.googleapis.com/v4/spreadsheets/'
  API_Key = 'AIzaSyDY_gHLV0A7liVYq64RxH7f7IYUKF15sOQ'
  API_params = 'valueRenderOption=UNFORMATTED_VALUE'
  requestURL = baseURL + SheetID + '/values/' + range + '?key=' + API_Key + '&' + API_params

  $.get(requestURL, function(obj) {
    console.log(requestURL)

    ref_data = obj.values
    console.log(ref_data[0]) //column gheaders

    data = ref_data
      .filter(filter_val => filter_val[0] === 2016)
      .map(function (val, idx) {
      return [val[1],val[10]]
    })

    column_name = data[0][1]
    $('.year_label').html(column_name)

    Highcharts.setOptions({
      lang: {
        thousandsSep: ",",
        contextButtonTitle: 'Export Chart',
        downloadPDF: 'Download as PDF',
        downloadCSV: 'Download chart data (CSV)',
        downloadXLS: 'Download chart data (Excel)'
      }
    })


    // Create the chart 
    map = Highcharts.mapChart('state_migration_map', {
      chart: {
        //height: 600,
        //width: 800,
        margin: [35, 0, 60, 0],
        spacingTop: 0,
        borderWidth: 0,
        events: {
          load: function() {
            this.renderer.image(logoURL,this.chartWidth-204,this.chartHeight-58,221,65).add() // (src,x,y,width,height)
          },
        },
      },

      credits: { enabled: false },

      subtitle: {
        //use subtitle element for our table notes
        text: null,
        widthAdjust: -300,
        align: 'left',
        x: 300,
        y: 0,
        verticalAlign: 'bottom',
        style: {
          color: '#999999',
          fontSize: '9px'
        }
      },

      title: {
        text: 'Domestic Migration: Net Flows<br/><span style="font-size: 15px;">' + '2016' + '</span>',
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
        //x: 10,
        symbolWidth: 280,
        backgroundColor: 'rgba(255, 255, 255, 0.0)',
        //reversed: true,
        /*labelFormatter: function () {
          if (!this.from & this.from != 0) {
            return 'Lower than ' + this.to
          } else if (!this.to & this.to != 0) {
            return 'More than ' + this.from
          } else {
            return this.from + ' to ' + this.to
          }
          //return this.from  + ' to ' + this.to ;
        }*/
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
        stops: [
          [0.1, '#AF3C31'], //Originally c4463a
          [0.4, '#E87171'],
          [0.5, '#D7F3F0'], //Originally fffbbc
          [0.9, '#1E328E'] //Originally 3060cf
        ],
        min: -200000,
        max: 200000,
        /*dataClasses: [
          {
            to: -1000,
            color: '#900404'
          }, {
            from: -1000,
            to: 0,
            color: '#D93B26'
          }, {
            from: 0,
            to: 1000,
            color: '#ABBFC3'
          }, {
            from: 1000,
            color: '#4E7686'
          }
        ],*/
      },

      series: [
        {
          type: 'map',
          name: 'Net Flows',
          mapData: states,
          //allAreas: true,
          allowPointSelect: true,
          states: {
            select: { color: "#222" } //highlights selected county
          },
          data: data,
          joinBy: ['GEOID', 0],
          keys: ['GEOID', 'value'],
          ///color: '#333',
          lineWidth: 2,
          point: {
            events: {
              click: function (event) {
                //console.log(event)
                console.log('clicked on map: ' + event.point.name)
                drilldownState(event.point.GEOID, event.point.name)
              },
              mouseOver: function (event) {
                //console.log(event)
                //console.log('moused over: ' + event.target.name)
                //drilldownState(event.target.GEOID, event.target.name)

              },
              select: function (event) {
                //console.log(event)
                //console.log('selected on map: ' + event.point.name)
                //drilldownState(event.point.GEOID, event.point.name)
              },
            },
          }
        }, /*{
          type: 'mapline',
          name: 'State borders',
          data: states,
          enableMouseTracking: false
        }*/
      ],

      tooltip: {
        useHTML: true,
        padding: 1,
        backgroundColor: 'rgba(247,247,247,1)',
        //formatter: 
      }, //end tooltip


      /*~~~~~~Exporting options~~~~~~*/
      exporting: {
        enabled: false,
        filename: "Highmaps test",
        menuItemDefinitions: {
          downloadFullData: {
            text: 'Download full dataset (Excel)',
            onclick: function () {
              window.open('http://www.jchs.harvard.edu/sites/jchs.harvard.edu/files/all_son_2017_tables_current_6_12_17.xlsx')
              alert('See tab A-1 for data from this chart')
            }
          }
        },
        buttons: {
          contextButton: {
            text: 'Export',
            menuItems: [
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
            }
          }
        }
      } //end exporting options
    }) //end Hicharts.mapChart
  }) //end get request callback
} //end createMap()


$('#year_slider').on('change', function () {
  selected_year = $('#year_slider').val()
  changeData(false)
})

$('#select_age').on('change', function () {
  selected_age_idx = $('#select_age').val()
  if (selected_age_idx != 10) {
    map.update({colorAxis: {min: -40000, max: 40000}})
  } else {
    map.update({colorAxis: {min: -200000, max: 200000}})
  }
  changeData(true)
})

function changeData (changeLineChart) {
  var new_data = []

  ref_data
    .filter(filter_val => filter_val[0] == selected_year)
    .forEach(function (val, idx) {
    new_data.push([val[1],val[selected_age_idx]])
  })

  $('#year_label').html(selected_year)
  map.series[0].setData(new_data)
  map.title.update({text: 'Domestic Migration: Net Flows<br/><span style="font-size: 15px;">' + selected_year + '</span>' })


  //change drilldown charts, if they exists
  if (typeof ageGroupChart !== 'undefined') {

    var GEOID = map.getSelectedPoints()[0].GEOID
    var state_name = map.getSelectedPoints()[0].name

    var new_chart_data = []
    var new_line_data = []

    ref_data.forEach(function (el) {
      if (el[1] == GEOID) {
        if (changeLineChart === true) {
          new_line_data.push( {y: el[selected_age_idx], x: el[0]} )
        } else {
          if (el[0] == selected_year) {
            el.slice(11,17).map(x => new_chart_data.push(x))
          } //end if
        }
      } //end if
    }) //end forEach

    if (changeLineChart === true) {
      timeSeriesChart.series[0].update({label: {enabled: false}})
      timeSeriesChart.series[0].update({
        name: 'Net Flow' + '<br/><span style="font-size: 10px; font-weight: normal;">' + $('#select_age :selected').html() + '</span>', 
        label: {enabled: true}
      })
      timeSeriesChart.series[0].setData(new_line_data)
    
    } else {
      ageGroupChart.series[0].setData(new_chart_data)
      $('#drilldown_title').html(state_name + ', ' + selected_year)

    }


  }

}

$('#year_slider').mousedown(function () {
  $('#year_label').removeClass('hidden')
});

$('#year_slider').mouseup(function () {
  $('#year_label').addClass('hidden')
});

//for cross-browser compatibility on slider drag
$("#year_slider").on('input', function () {
  $(this).trigger('change');
});



function drilldownState (GEOID, state_name) {
  console.log(GEOID + ' ' + state_name)

  $('#drilldown_title').html(state_name + ', ' + selected_year)

  var chart_data = []
  var line_data = []

  ref_data.forEach(function (el) {
    if (el[1] == GEOID) {
      line_data.push( {y: el[selected_age_idx], x: el[0]} )

      if (el[0] == selected_year) {
        el.slice(11,17).map(x => chart_data.push(x))
      } //end if
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

    title: {
      text: null
    },

    xAxis: {
      categories: ['<26', '26-34', '35-44', '45-54', '55-64', '65+'],
      labels: { overflow: false },
      tickInterval: 1,
      tickLength: 0,
    },

    yAxis: {
      title: {
        text: null
      }
    },

    credits: { enabled: false },
    legend: { enabled: false },
    exporting: { enabled: false },

    series: [{
      name: 'Net Flow',
      data: chart_data,
      zones: [
        {
          value: 0,
          color: '#AF3C31'
        }, {
          color: '#4E7686' 
        },
      ],
    }] //end series
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

    title: { text: null },

    xAxis: {
      labels: {
        overflow: false
      },
      tickInterval: 1,
      tickLength: 0

    },

    yAxis: {
      title: {
        text: null
      }
    },

    credits: { enabled: false },
    legend: { enabled: false },
    exporting: { enabled: false },

    series: [{
      name: 'Net Flow' + '<br/><span style="font-size: 10px; font-weight: normal;">' + $('#select_age :selected').html() + '</span>',
      data: line_data,
      color: '#555',

      zones: [
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
      ],
    }] //end series
  }) //end line chart

  //add button to clear the selection
  if (!$('#clear_button').length) {
    map.renderer.button('Clear<br />selection',440,255)
      .attr({
      padding: 3,
      id: 'clear_button'
    })
      .add()

    $('#clear_button').click(function () { 
      map.series[0].data[map.getSelectedPoints()[0].index].select()

      $('#clear_button').remove()
      $('#drilldown_title').html('')
      $('#age_group_chart').append('<h4 class="map-instructions">Click on a state to see age groups<br>and change over time ==></h4>')

      timeSeriesChart.destroy()
      ageGroupChart.destroy()

    })
  }

} // end drilldownState()

