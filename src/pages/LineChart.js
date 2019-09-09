import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: { currency: {
    type: String,
    default: '$'
  } },
  computed: {
    options () {
      return {
        responsive: true,
        maintainAspectRatios: false,
        scales: {
          yAxes: [{
            ticks: {
              callback: (value, index, values) => {
                let newVal = value
                if (value > 0) {
                  // if value is greater than 0 in chart label (Y Axis) and if value is 0.10 then show 0.10 as well not just 0.1 or .1
                  newVal = value.toFixed(2).toString().replace(/^0+/, '')
                }
                return `${this.currency}${newVal}`
              }
            }
          }]
        },
        tooltips: {
          enabled: true,
          callbacks: {
            label: (tooltipItems, data) => {
              console.log(this)
              return '$' + tooltipItems.yLabel
            }
          }
        }
      }
    }
  },
  mounted () {
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    this.renderChart(this.chartData, this.options)
  }
}
