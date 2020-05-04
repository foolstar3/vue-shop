<template>
  <div>
    <el-card>
      <!-- 搜索区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="orderList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number" width="200"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.is_send === '是'">已发货</el-tag>
            <el-tag type="danger" v-else>未发货</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template v-slot="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="addressDialogShow"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="progressDialogShow"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination 
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>

      <!-- 修改地址对话框 -->
      <el-dialog
        title="修改地址"
        :visible.sync="addressVisible"
        center
        width="50%"
        @close="addressDialogClosed">
        <!-- 内容区域 -->
        <el-form :model="addressForm" label-width="100px" :rules="addressFormRules">
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader :options="citydata" :props="addressProps" v-model="addressForm.address1"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button type="primary">确认</el-button>
          <el-button @click="addressVisible = false">取消</el-button>
        </span>
      </el-dialog>

      <!-- 物流进度对话框 -->
      <el-dialog
        title="物流进度"
        :visible.sync="progressVisible"
        center
        width="50%"
        @close="progressDialogClosed">
        <!-- 内容区域 -->
        <el-timeline :reverse="reverse">
          <el-timeline-item
            v-for="(activity, index) in progressList"
            :key="index"
            :timestamp="activity.time">
            {{activity.context}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import citydata from './citydata'
export default {
  data() {
    return {
      // 获取订单数据的请求参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单总数
      total: 0,
      // 订单数据对象数组
      orderList: [],
      // 修改地址对话框的显示与隐藏
      addressVisible: false,
      // 收货地址对象
      addressForm: {
        address1: '',
        address2: ''
      },
      // 收货地址的验证规则对象
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur'}
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur'}
        ]
      },
      // 省市区数据
      citydata,
      // 收货地址级联选择器属性
      addressProps: {
        expandTrigger: 'hover'
      },
      // 物流进度对话框显示与隐藏
      progressVisible: false,
      // 物流进度数据
      progressList: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取所有订单数据
    async getOrderList() {
      // console.log(this.queryInfo);
      
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单数据失败!')
      }
      // 获取成功
      this.orderList = res.data.goods
      this.total = res.data.total
      // console.log(this.orderList);
      // console.log(this.total);
    },
    // 监听每页数据量变化事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 监听当前页数变化事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 显示修改地址对话框
    addressDialogShow() {
      this.addressVisible =true
    },
    // 监听修改地址对话框关闭事件
    addressDialogClosed() {
      this.addressForm.address1 = ''
      this.addressForm.address2 = ''
    },
    // 显示物流进度对话框
    async progressDialogShow() {
      const { data: res } = await this.$http.get(`/kuaidi/804909574412544580`)
      console.log(res);
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败!')
      }
      this.progressList = res.data
      this.progressVisible = true
      console.log(this.progressList);
      
    },
    // 监听物流进度对话框关闭事件
    progressDialogClosed() {
      this.progressVisible = false
    }
  }
}
</script>

<style lang="less" scoped>

</style>