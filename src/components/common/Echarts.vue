<template>
  <div>
    <div :class="className" :id="id" style="min-height: 350px;">
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'

export default {
  name: 'chart',
  props: {
    className: {
      type: String,
      default: 'green'
    },
    id: {
      type: String,
      default: 'barchart'
    },
    options: {
      type: Object
    }
  },
  data() {
    return {
      chart: null,
    }
  },
  mounted() {
    
    this.initChart()
  },
  beforeDestroy() {

  },
  methods: {
    initChart(opt) {
      this.chart = echarts.init(document.getElementById(this.id));
        let colors = ['#179F5D', '#4A8AF3', '#DA4C3F', '#DDFF8C', '#1CDDFF'];
        let option = {
          color: colors,
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'line'
            }
          },
          grid: {
            right: '20%'
          },
          toolbox: {
            feature: {
              dataView: {show: true, readOnly: false},
              restore: {show: true},
              saveAsImage: {show: true}
            }
          }
        }
        option = opt ? opt : option
        this.chart.setOption(option)
    }
  },
  watch:{
    // 组件间对象的监听!!!
    options(newValue,oldValue){
      if(newValue !== oldValue) {
        this.initChart(newValue)
      }
    }
  }
}
</script>

<style>

</style>