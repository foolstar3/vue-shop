<template>
  <div>
    <!-- 卡片视图 -->
    <el-card shadow="hover">
      <!-- 搜索与添加区域 --> 
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input v-model="queryInfo.query" placeholder="请输入内容" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- tableb表格区域 -->
      <el-table :data="goodsList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" width="160px">
          <template v-slot="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="160px">
          <template v-slot="scope">
            {{scope.row.upd_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editGoodsDialogShow(scope.row)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGoodsById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        background
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 编辑商品信息对话框 -->
    <el-dialog
      title="编辑商品"
      center
      :visible.sync="editGoodsDialogVisible"
      width="50%">
      <!-- 编辑表格区域 -->
      <el-form :model="editGoodsInfo" ref="editGoodsForm" :rules="editGoodsFormRules">
        <el-form-item label="商品名称" prop="goods_name" label-width="80px">
          <el-input v-model="editGoodsInfo.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="价格" prop="goods_price" label-width="80px">
          <el-input v-model="editGoodsInfo.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="数量" prop="goods_number" label-width="80px">
          <el-input v-model="editGoodsInfo.goods_number"></el-input>
        </el-form-item>
        <el-form-item label="重量" prop="goods_weight" label-width="80px">
          <el-input v-model="editGoodsInfo.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editGoods">确 定</el-button>
        <el-button @click="editGoodsDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取商品列表的查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品数据总条数
      total: 0,
      // 商品数据列表
      goodsList: [],
      // 当前商品信息
      editGoodsInfo: [],
      // 编辑商品表格的规则对象
      editGoodsFormRules: {
        goods_name: [
          { required: true, message: '请填写商品名称', trigger: 'blur'}
        ],
        goods_price: [
          { required: true, message: '请填写商品价格', trigger: 'blur'}
        ],
        goods_number: [
          { required: true, message: '请填写商品数量', trigger: 'blur'}
        ],
        goods_weight: [
          { required: true, message: '请填写商品重量', trigger: 'blur'}
        ]
      },
      // 编辑商品对话框隐藏与显示
      editGoodsDialogVisible: false
    }
  },
  created() {
    this.getGoodsList()
    },
  methods: {
    // 获取所有商品列表数据
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      // 获取数据请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败!')
      }
      // 获取数据成功
      this.goodsList = res.data.goods
      
      this.total = res.data.total
    },
    // 处理每页数据量变化事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 处理当前页数变化事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 展示编辑商品对话框
    async editGoodsDialogShow(row) {
      // 通过id获取当前商品信息
      const { data: res } = await this.$http.get(`goods/${row.goods_id}`)
      // 获取失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品数据失败!')
      }
      // 获取成功
      this.editGoodsInfo = res.data
      console.log(this.editGoodsInfo)
      // 弹出编辑对话框
      this.editGoodsDialogVisible = true
    },
    // 通过商品id删除商品
    async deleteGoodsById(id) {
      // 询问是否删除
      const confirmResult = await this.$confirm(
        '您将永久删除该商品，是否继续？',
        '提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      // 取消删除
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作!')
      }
      // 确认删除,发起请求
      const { data:res } = await this.$http.delete(`goods/${id}`)
      // 删除失败
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品数据失败!')
      }
      // 删除成功
      this.$message.success('删除商品数据成功!')
      this.getGoodsList()
    },
    // 编辑商品
    editGoods() {
      // 预验证
      this.$refs.editGoodsForm.validate( async valid => {
        if (!valid) return
        // 发起编辑请求
        const { data: res } = await this.$http.put(`goods/${this.editGoodsInfo.goods_id}`,
          {
            goods_name: this.editGoodsInfo.goods_name,
            goods_price: this.editGoodsInfo.goods_price,
            goods_number: this.editGoodsInfo.goods_number,
            goods_weight: this.editGoodsInfo.goods_weight,
            goods_introduce: this.editGoodsInfo.goods_introduce,
            pics: this.editGoodsInfo.pics,
            attrs: this.editGoodsInfo.attrs,
            goods_cat: this.editGoodsInfo.goods_cat
          }  
        )
        // 编辑请求失败
        if (res.meta.status !== 200) {
          return this.$message.error('编辑商品失败!')
        }
        // 编辑请求成功
        this.$message.success('编辑商品成功!')
        this.getGoodsList()
        this.editGoodsDialogVisible = false
      })
    },
    // 跳转添加商品页
    goAddPage() {
      this.$router.push({path:'/goods/add'})
    }
  }
}
</script>

<style lang="less" scoped>

</style>