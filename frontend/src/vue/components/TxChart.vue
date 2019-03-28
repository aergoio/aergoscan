<template>
  <div class="chart">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js';

export default {
  props: ['data', 'unit'],
  data () {
    return {
    }
  },
  watch: {
    data(val, oldVal) {
      if (!this.chart) return;
      this.chart.data.datasets[0].data = val;
      if (this.$props.unit === 'second') {
        this.chart.options.scales.xAxes[0].time.min = new Date() - 60 * 1000;
      } else {
        this.chart.options.scales.xAxes[0].time.min = 0;
      }
      this.chart.update();
    },
    unit(val, oldVal) {
      if (!this.chart) return;
      this.chart.options.scales.xAxes[0].time.unit = val;
      this.chart.update();
    }
  },
  mounted () {
    let min = 0;
    if (this.$props.unit === 'second') {
      min = new Date() - 60 * 1000;
    }
    this.chart = new Chart(this.$refs.canvas, {
      type: 'line',      
      data: {
        labels: [],
        datasets: [{
          label: 'Number of tx',
          backgroundColor: 'transparent',
          pointBorderWidth: 2,
          pointBorderColor: '#FF36AD',
          borderColor: '#FF36AD',
          borderWidth: 1,
          pointRadius: 4,
          lineTension: 0.2,
          data: this.$props.data,
        }]
      },
      options: {
        maintainAspectRatio: false,
        legend: false,
        tooltips: {
          mode: 'index',
          intersect: false,
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          yAxes: [{
            gridLines: {},
            ticks: {
              beginAtZero: true,
              padding: 10,
              suggestedMax: 10,
            }
          }],
          xAxes: [{
            type: 'time',
            gridLines: {
              tickMarkLength: 10,
              drawOnChartArea: false,
            },
            time: {
              unit: this.$props.unit || 'auto',
              min: min
            },
            ticks: {
              padding: 10,
            }
          }]
        }
      }
    });
  },
};
</script>

<style lang="scss">
.chart {
  position: relative;
  width: 100%;
  height: 200px;
}
</style>

