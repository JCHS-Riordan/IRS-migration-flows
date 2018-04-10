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
        margin: [50,10, 75, 10],
        borderWidth: 0,
        events: {
          load: function(event) {
            this.renderer.image(logoURL,0,this.chartHeight-80,289,85).add() // (src,x,y,width,height)
          },
        },
      },

      credits: { enabled: false },

      subtitle: {
        //use subtitle element for our table notes
        text: 'Notes: Data are measured using tax exemptions, which approximate individuals. <br/> Source: JCHS tabulations of IRS, SOI Migration Data.',
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
          text: 'Net flow<br />of individuals'  
        },
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        y: -10,
        x: 140,
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
        enabled: true
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
        enabled: true,
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
  selected_year = this.value
  new_data = ref_data
    .filter(filter_val => filter_val[0].toString() === selected_year)
    .map(function (val, idx) {
    return [val[1],val[10]]
  })
  //console.log(new_data)
  $('#year_label').html(selected_year)
  map.series[0].setData(new_data)
  map.title.update({text: 'Domestic Migration: Net Flows<br/><span style="font-size: 15px;">' + selected_year + '</span>' })

})

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

  var chart_data = []
  var line_data = []
  
  ref_data.forEach(function (el) {
    if (el[1] == GEOID) {
      line_data.push( {y: el[10], x: el[0]} )

      if (el[0] == selected_year) {
          el.slice(11,17).map(x => chart_data.push(x))
      } //end if
    } //end if
  }) //edn forEach

  $('#drilldown_title').html(state_name + ', ' + selected_year)

  $("#age_group_chart").highcharts({
    chart: {
      type: 'column',
      spacingTop: 0,
      marginTop: 10,
      spacingBottom: 10,
      spacingRight: 11,
      marginLeft: 50
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

  
  $("#time_series_chart").highcharts({
    chart: {
      type: 'line',
      spacingTop: 0,
      marginTop: 5,
      spacingBottom: 0,
      spacingRight: 11,
      marginLeft: 50
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
      name: 'Net Flow',
      data: line_data,
      color: '#777',

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
} // end drilldownState()

