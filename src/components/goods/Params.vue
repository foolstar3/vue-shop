<template>
  <div>
    <!-- 导航面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    
    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意:只允许为第三级分类设置相关参数!"
        type="warning"
        :closable="false"
        show-icon>
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span class="mrgrt">选择商品分类:</span>
          <el-cascader :options="cateList" :props="cateProps" v-model="selectedCateKeys" @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <!-- 动态参数页 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addParamsDialogShow">添加参数</el-button>
          <!-- 动态表格区域 -->
          <el-table :data="manyTableData">
            <!-- 详细列 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!-- 动态渲染参数标签 -->
                <el-tag class="mrgrt" type="primary" v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleTagClose(scope.row,index)">
                  {{item}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="mini"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button class="button-new-tag" v-else size="mini" @click="showInput(scope.row)">添加新标签</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editParamsDialogShow(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParamsById(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性页 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addParamsDialogShow">添加参数</el-button>
          <!-- 静态表格区域 -->
          <el-table :data="onlyTableData">
            <el-table-column type="expand">
              <template v-slot="scope">
                <!-- 动态渲染参数标签 -->
                <el-tag class="mrgrt" type="primary" v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleTagClose(scope.row,index)">
                  {{item}}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="mini"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button class="button-new-tag" v-else size="mini" @click="showInput(scope.row)">添加新标签</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editParamsDialogShow(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParamsById(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog 
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      center
      @close="addDialogClosed">
      <el-form label-width="100" :model="addManyParamsForm" ref="addParamsFormRef" :rules="addManyParamsFormRules">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addManyParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addParams">确 定</el-button>
        <el-button @click="addDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数对话框 -->
    <el-dialog 
      :title="'编辑' + titleText"
      :visible.sync="editParamsDialogVisible"
      width="50%"
      center
      @close="editParamsDialogClosed">
      <el-form label-width="100" :model="editParamsForm" ref="editParamsFormRef" :rules="editParamsFormRules">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editParams">确 定</el-button>
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 级联选择框选中的值
      selectedCateKeys: '',
      // 默认选中的页签
      activeName: 'many',
      // 动态参数列表数据
      manyTableData: [],
      // 静态参数列表数据
      onlyTableData: [],
      // 添加参数表格的数据对象
      addManyParamsForm: {
        attr_name: ''
      },
      // 编辑参数表格的数据对象
      editParamsForm: {
        attr_name: '',
        attrId: ''
      },
      // 添加参数表格的规则对象
      addManyParamsFormRules: {
        attr_name: [
          { required: 'true', message: '请填写参数名称', trigger: 'blur'}
        ]
      },
      // 编辑参数表格的规则对象
      editParamsFormRules: {
        attr_name: [
          { required: 'true', message: "请填写参数名称", trigger: 'blur'}
        ]
      },
      // 添加动态参数对话框的显示与隐藏
      addDialogVisible: false,
      // 编辑参数对话框的显示与隐藏
      editParamsDialogVisible: false,

    }
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get(`categories`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }
      this.cateList = res.data
      // console.log(this.cateList);
    },
    // 处理级联选择器所选项变化
    handleChange() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // console.log(this.selectedCateKeys);
      // 请求商品参数
      this.getParamsDate()
    },
    // 发起获取商品参数请求
    async getParamsDate() {
      const { data: res } = await this.$http.get(
        `categories/${this.selectedCateKeys[2]}/attributes`,
        { params: 
          { 
            sel: this.activeName 
          }
        }
      )
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('请求商品参数失败!')
      }
      res.data.forEach(item => {
        // 将参数标签数据数组化
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制输入框的显示与隐藏
        item.inputVisible = false
        // 输入框的值
        item.inputValue = ''

      })
      
      // console.log(res.data);
      // 判断是动态参数还是静态参数
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 处理页签变化
    handleClick() {
      console.log(this.activeName);
      this.getParamsDate()
    },
    // 点击显示添加动态参数表格
    addParamsDialogShow() {
      this.addDialogVisible = true
    },
    // 监听关闭添加参数对话框事件
    addDialogClosed() {
      this.$refs.addParamsFormRef.resetFields()
      this.addManyParamsForm.attr_name = ''
    },
    // 添加参数或属性
    addParams() {
      this.$refs.addParamsFormRef.validate(async valid => {
        if(!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`,
          {
            attr_name: this.addManyParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        console.log(res);
        
        // 请求失败
        if(res.meta.status !== 201) {
          return this.$message.error('添加参数失败!')
        }

        // 请求成功
        this.$message.success('添加参数成功!')
        this.getParamsDate()
        this.addDialogVisible = false
      })
    },
    // 编辑参数或属性
    editParams() {
      // 预验证
      this.$refs.editParamsFormRef.validate(async valid => {
        if(!valid) return
        // 发起编辑参数请求
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamsForm.attrId}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        // 请求失败
        if(res.meta.status !== 200) {
          return this.$message.error('编辑参数失败!')
        }
        // 请求成功
        this.$message.success('编辑参数成功!')
        this.getParamsDate()
        this.editParamsDialogVisible = false
      })
    },
    // 显示编辑参数对话框
    async editParamsDialogShow(id) {
      // 保存属性id
      this.editParamsForm.attrId = id
      // 根据参数id发起请求查询参数名
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`,
        {
          attr_sel: this.activeName
        }
      )
      // 请求失败
      if(res.meta.status !== 200) {
        return this.$message.error('获取参数名失败')
      }
      // 请求成功为编辑参数表格属性名赋值
      this.editParamsForm.attr_name = res.data.attr_name
      this.editParamsDialogVisible = true
    },
    // 监听关闭编辑参数对话框事件
    editParamsDialogClosed() {
      this.$refs.editParamsFormRef.resetFields()
      this.editParamsForm.attr_name = ''
      this.editParamsForm.attrId = ''
    },
    // 删除参数属性
    async deleteParamsById(id) {
      const confirmResult = await this.$confirm(
        '您将永久删除该参数，是否继续？',
        '提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 取消删除
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除!')
      }
      // 确认删除，发起删除请求
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      // 删除请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败!')
      }
      // 删除请求成功
      this.$message.success('删除参数成功!')
      this.getParamsDate()
    },
    // 处理标签输入确认事件
    handleInputConfirm(row) {
      // 处理输入框内容
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
        return
      }
      // 将添加的新标签值加入数组
      row.attr_vals.push(row.inputValue.trim())
      // 发起添加新标签请求
      this.saveAttrVals(row)
      // 数据库执行完成后执行页面的更新
        row.inputValue = '',
        row.inputVisible = false
    },
    // 发起请求修改标签的值
    async saveAttrVals(row) {
      // console.log(row);
      // 发起修改标签请求
      const { data: res } = await this.$http.put(`categories/${row.cat_id}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ') 
        }
      )
      console.log(res);
      
      // 修改新标签请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('添加新标签失败!')
      }
      // 修改新标签请求成功
      this.$message.success('添加新标签成功!')
    },
    // 显示标签输入框
    showInput(row) {
      row.inputVisible = true
      // 让输入框自动获得焦点
      // $nextTick 方法的作用，是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick( () => {
        this.$refs.saveTagInput.focus()
      })
    },
    // 处理删除标签事件
    handleTagClose(row,index) {
      // 将删除的标签移除数组
      row.attr_vals.splice(index,1)
      // 发送修改请求
      this.saveAttrVals(row)
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    // 是否禁用添加参数按钮
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 选中的三级分类的id
    cateId() {
      if (this.selectedCateKeys.length !== 3) {
        return null
      }
      return this.selectedCateKeys[2]
    },
    // 页签对话框title
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.mrgrt {
  margin-right: 15px;
}
.input-new-tag {
  width: 100px;
}
</style>