<template>
  <div>
    <el-card>
      <!-- 2.为ECharts准备一个具备大小（宽高）的Dom -->
      <div class="chart_containe">
        <bar-chart :className="red" :options="options" :id="id" width="750px"></bar-chart>
      </div>
    </el-card>
  </div>
</template>

<script>
// 1.导入echarts组件
import barChart from '../common/Echarts.vue'
export default {
  data() {
    return {
      id: 'gongjing',
      red: 'red',
      // echarts数据源
      options: {
        legend: {},
        xAxis: [],
        yAxis: [],
        series: []
      }
    }
  },
  components: {
    barChart
  },
  created() {
    this.getReportData()
  },
  mounted() {
    
  },
  methods: {
    // 获取折线图数据
    async getReportData() {
      const { data: res }= await this.$http.get('reports/type/1')
      if (res.meta.status !== 200) {
        return this.$message.error('获取折线图数据失败!')
      }
      // 将获取的数据赋值给echarts的options
      
      this.options = {
        legend: res.data.legend,
        yAxis: res.data.yAxis,
        xAxis: res.data.xAxis,
        series: res.data.series
      }
      
    }
  }
}
</script>

<style lang="less" scoped>

</style>