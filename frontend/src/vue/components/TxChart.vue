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
      this.chart.update();
    },
    unit(val, oldVal) {
      if (!this.chart) return;
      this.chart.options.scales.xAxes[0].time.unit = val;
      this.chart.update();
    }
  },
  mounted () {
    this.chart = new Chart(this.$refs.canvas, {
      type: 'line',      
      data: {
        labels: [],
        datasets: [{
          label: 'Number of tx',
          backgroundColor: 'transparent',
          pointBorderWidth: 2,
          pointBorderColor: '#F90F5F',
          borderColor: '#F90F5F',
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
            }
          }],
          xAxes: [{
            type: 'time',
            gridLines: {
              tickMarkLength: 10,
              drawOnChartArea: false,
            },
            time: {
              unit: this.$props.unit || 'auto'
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

