//Hello from Matthew

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/*~~~ https://api.highcharts.com/highmaps/ ~~~~*/
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
cbsas = Highcharts.geojson(Highcharts.maps['countries/us/cbsa'])
states = Highcharts.geojson(Highcharts.maps['countries/us/states'])
logoURL = 'http://www.jchs.harvard.edu/sites/jchs.harvard.edu/files/harvard_jchs_logo_2017.png'

var ref_data = []
var data = []
var categories = []

$(document).ready(function() {

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
    categories = ref_data[0]
    console.log(categories)
    data = ref_data.map(function (val, idx) {
      //x.splice(1,1)
      if (val[0] === 2016) {
          return [val[1],val[12]]
      } else {
        return false
      }
    })
    //data = obj.values
    column_name = data[0][1]
    $('.year_label').html(column_name)
    console.log(ref_data)
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
        margin: [50, 30, 75, 10],
        borderWidth: 0,
        events: {
          load: function(event) {
            this.renderer.image(logoURL,0,this.chartHeight-80,289,85).add() // (src,x,y,width,height)
          },
        },
      },

      credits: {
        enabled: false
      },

      subtitle: {
        //use subtitle element for our table notes
        text: 'Notes: Data are measured using tax exemptions, which approximate individuals. <br/> Source: JCHS tabulations of IRS, SOI Migration Data.',
        widthAdjust: -300,
        align: 'left',
        x: 300,
        y: -25,
        verticalAlign: 'bottom',
        style: {
          color: '#999999',
          fontSize: '9px'
        }
      },

      title: {
        text: 'Domestic Migration: Net Flows<br/><span style="font-size: 15px;">' + '26 - 34 Year Olds, 2016' + '</span>',
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
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        y: 110,
        x: 15,
        //symbolHeight: 140,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        //reversed: true,
        labelFormatter: function () {
          if (!this.from & this.from != 0) {
            return 'Lower than ' + this.to
          } else if (!this.to & this.to != 0) {
            return 'More than ' + this.from
          } else {
            return this.from + ' to ' + this.to
          }
          //return this.from  + ' to ' + this.to ;
        }
      },

      mapNavigation: {
        enabled: true
      },

      colorAxis: {
        //type: 'linear',
        dataClasses: [
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

        ],
      },

      //colors: ['#C14D00', '#E4DCD5', '#6BA2B8'],

      series: [
        {
          type: 'map',
          name: column_name,
          mapData: states,
          //allAreas: true,
          data: data,
          joinBy: ['GEOID', 0],
          keys: ['GEOID', 'value'],
          color: '#333',
          lineWidth: 2,
          point: {
            events: {
              click: function (event) {
                console.log('clicked on map: ' + event.point.name)
                console.dir(event.point)
                getMetroInfo(event.point.GEOID, event.point.name)
              }
            }
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
          formatter: function() {
            var GEOID = this.point.GEOID
            var state_name = this.point.name
            setTimeout( function() {
              chart_data = []
              tooltip_table = '<table><tr><th>Net Flow by Year</th></tr>'
              $.each(ref_data, function (idx, el) {
                if (el[0] == GEOID) {
                  console.log(el[0])
                  for (i = 2; i<10; i++) {
                    chart_data.push(el[i])
                    tooltip_table = tooltip_table + '<tr><td>'+ categories[i] +'</td><td>' + el[i] + '</td></tr>'
                  }
                }
              } )
              tooltip_table = tooltip_table + '</table>'
              console.log(chart_data)
              $("#hc-tooltip").highcharts({
                chart: {
                  spacingTop: 5,
                  marginTop: 20,
                  spacingBottom: 5
                  //backgroundColor: 'rgba(255,255,255,0.95)',
                },

                title: {
                  text: state_name,
                  style: {
                    fontSize: '15px'
                  }
                },

                credits: {
                  enabled: false
                },

                legend: {
                  enabled: false  
                },

                exporting: {
                  enabled: false
                },

                yAxis: {
                  labels: {
                    format: '{value}%'
                  },

                  title: {
                    text: null
                  }
                },

                tooltip: {
                  pointFormat: '<b>{point.y}</b>',
                  valueSuffix: '%'
                },

                xAxis: {
                  //categories: categories.slice(2,10),
                  categories: [categories[2], categories[12]],
                  labels: {
                    autoRotation: 0,
                    overflow: false
                  },
                  
                  tickInterval: 7,
                  
                  tickLength: 0

                },

                series: [{
                  name: 'Net Flow',
                  data: chart_data,
                  color: '#4E7686',
                  //animation: false,
                  zones: [
                    {
                      value: -5,
                      color: '#C14D00'
                    }, {
                      value: 0,
                      color: '#F5C35C'
                    }, {
                      value: 5,
                      color: '#E4DCD5'
                    }, {
                      value: 10,
                      color: '#ABBFC3'
                    }, {
                      color: '#4E7686'
                    }
                  ],
                }]
              });
            }, 10)
            console.log(this)
            return '<div id="hc-tooltip" class="tooltip_chart"></div>' //+ tooltip_table;
          }
        },

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
            },
          },
        },

      }
    })
    console.log(data)


  })

}) //end

//for cross-browser compatibility on slider drag
$("#year_slider").on('input', function () {
  $(this).trigger('change');
});

$('#year_slider').on('change', function () {
  var selected_year = this.value
  new_data = ref_data.map(function (val, idx) {
    //x.splice(1,1)
    if (val[0] === selected_year) {
      return [val[1],val[12]]
    } else {
      return false
    }
  })
         console.log(new_data)
  column_name = new_data[0][1]
  $('#year_label').html(column_name)
  map.series[0].setData(new_data)
  map.title.update({text: 'Domestic Migration: Net Flows<br/><span style="font-size: 15px;">' + column_name + '</span>' })




})

$('#year_slider').mousedown(function () {
  $('#year_label').removeClass('hidden')
});

$('#year_slider').mouseup(function () {
  $('#year_label').addClass('hidden')
});

function getMetroInfo(GEOID, metro_name) {
  console.log(GEOID)
  chart_data = []
  $.each(ref_data, function (idx, el) {
    if (el[0] == GEOID) {
      console.log(el[0])
      for (i = 2; i<10; i++) {
        chart_data.push(el[i])
      }
    }
  } )
  console.log(chart_data)
  var chart = Highcharts.chart("drilldown_chart", {
    chart: {
      spacingTop: 1,
      marginTop: 30
    },

    title: {
      text: metro_name,
      style: {
        fontSize: '15px'
      }
    },

    credits: {
      enabled: false
    },

    legend: {
      enabled: false  
    },

    exporting: {
      enabled: false
    },

    yAxis: {
      labels: {
        format: '{value}%'
      },

      title: {
        text: null
      }
    },

    tooltip: {
      pointFormat: '<b>{point.y}</b>',
      valueSuffix: '%'
    },

    xAxis: {
      categories: categories.slice(2,10)
    },

    series: [{
      name: 'LIRA',
      data: chart_data,
      color: '#4E7686',
      zones: [
        {
          value: -5,
          color: '#C14D00'
        }, {
          value: 0,
          color: '#F5C35C'
        }, {
          value: 5,
          color: '#E4DCD5'
        }, {
          value: 10,
          color: '#ABBFC3'
        }, {
          color: '#4E7686'
        }
      ],
    }]
  });

} //end getMetroInfo()
