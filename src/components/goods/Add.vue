<template>
  <div>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 文字提示区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        center>
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps :active="activeStep - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tabs标签区域 -->
      <el-form :model="addForm" ref="addFormRef" :rules="addFormRules" label-position="top">
        <el-tabs tab-position="left" v-model="activeStep" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <!-- 基本信息面板 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number" min="0"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number" min="0"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number" min="0"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="categories"
                :props="goodsCatProps"
                @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数面板 -->
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id" >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals" size="mini">
                <el-checkbox :label="cb" border v-for="(cb,index) in item.attr_vals" :key="index"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性面板 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片面板 -->
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              list-type="picture"
              :headers="headerObj">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button class="confirmBtn" type="primary" @click="addGoods">确认</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog :visible.sync="previewVisible" :title="previewName" center>
      <img :src="previewURL" :alt="previewName" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 当前所处的步骤
      activeStep: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 存放上传图片的临时地址
        pics: [],
        // 商品介绍
        goods_introduce: '',
        // 参数和属性
        attrs: []
      },
      // 级联选择器的属性
      goodsCatProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 添加商品的表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请填写商品名称', trigger: 'blur'}
        ],
        goods_price: [
          { required: true, message: '请填写商品价格', trigger: 'blur'}
        ],
        goods_weight: [
          { required: true, message: '请填写商品重量', trigger: 'blur'}
        ],
        goods_number: [
          { required: true, message: '请填写商品数量', trigger: 'blur'}
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur'}
        ]
      },
      // 所有商品分类
      categories: [],
      // 商品参数数据
      manyTableData: [],
      // 商品属性数据
      onlyTableData: [],
      // 图片上传url
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的header请求头对象
      headerObj: {
        authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片的url
      previewURL: '',
      // 预览图片的名称
      previewName: '',
      // 预览图片对话框的显示与隐藏
      previewVisible: false
    }
  },
  methods: {
    // 获取所有商品分类
    async getCateList() {
      // 发起请求
      const { data: res } = await this.$http.get('categories')
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }
      // 请求成功
      this.categories = res.data
      // console.log(this.categories);
      
    },
    // 处理级联选择器选项变化事件
    handleChange() {
      // console.log(this.addForm.goods_cat);
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        this.$message.info('请选择三级分类！')
      }
    },
    // 页签变化事件
    async tabClicked() {
      switch (this.activeStep) {
        case '1':
          // 前往动态参数页
          // 发起请求获取动态参数
          const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
            {
              params: { sel: 'many'}
            }
          )
          if(res.meta.status !== 200) {
            return this.$message.error('获取商品参数失败!')
          }
          this.manyTableData = res.data
          console.log(this.manyTableData);
          // 获取每个动态参数名称和值
          this.manyTableData.forEach(item => {
            // 将存储的动态参数字符串转换成数组形式
            item.attr_vals = item.attr_vals.length ? item.attr_vals.split(',') : []
          })
          break
        case '2':
          // 前往商品属性页
          // 发起请求获取商品属性
          const { data: onlyRes } = await this.$http.get(`categories/${this.cateId}/attributes`,
            {
              params: { sel: 'only'}
            }
          )
          if(onlyRes.meta.status !== 200) {
            return this.$message.error('获取商品参数失败!')
          }
          this.onlyTableData = onlyRes.data
          console.log(this.onlyTableData);
          
      }
    },
    // 页签变化之前的事件
    beforeTabLeave(activeName, oldActiveName) {
      // console.log(oldActiveName + '=>' + activeName);
      // 表格内容是否填写完成
      // 验证表格完成度
      if (this.addForm.goods_name === '' && oldActiveName === '0') {
        this.$message.error('请先填写商品名称!')
        return false
      } else if (this.addForm.goods_cat.length !== 3 && oldActiveName === '0') {
        this.$message.error('请先选择商品分类!')
        return false
      }
    },
    // 监听上传图片预览事件
    handlePreview(res) {
      // console.log(res);
      // 获取图片的url和名称
      this.previewURL = res.response.data.url
      // 去掉图片名的文件后缀
      this.previewName = res.name.split('.')[0]
      // 显示预览图片对话框
      this.previewVisible = true
    },
    // 监听移除图片事件
    handleRemove(res) {
      // console.log(res);
      // 获取要删除的图片临时路径
      const tmp_path = res.response.data.tmp_path
      // 获取pics数组中要删除图片的index
      const index = this.addForm.pics.findIndex(item => item.pic === tmp_path)
      // console.log(index);
      
      // 移除addForm中对应的图片tmp_path
      this.addForm.pics.splice(index, 1)
      // console.log(this.addForm);
      
    },
    // 监听上传成功事件
    handleSuccess(response) {
      // console.log(response);
      // 将图片的tmp_path存入addForm表单中
      this.addForm.pics.push({'pic':response.data.tmp_path})
      // console.log(this.addForm);
    },
    // 添加商品
    async addGoods() {
      // 预验证
      this.$refs.addFormRef.validate(valid => {
        if (!valid) {
          return this.$message.error('请完成必要的表单项!')
        }
      })

      // 深拷贝获取addForm对象
      const paramsForm = JSON.parse(JSON.stringify(this.addForm))
      
      // 获取参数和属性
      this.manyTableData.forEach(item => {
        const newInfo = { 
          attr_id: item.attr_id, 
          attr_value: item.attr_vals.join(',')
        }
        paramsForm.attrs.push(newInfo)
      })

      this.onlyTableData.forEach(item => {
        const newInfo = { 
          attr_id: item.attr_id, 
          attr_value: item.attr_vals
        }
        paramsForm.attrs.push(newInfo)
      })
      // 获取商品分类（字符串形式）
      paramsForm.goods_cat = this.selectedCateKeys
      console.log(paramsForm);
      // 发起添加商品请求
      const { data: res } = await this.$http.post(`goods`,  paramsForm)
      console.log(res);
      
      // 请求失败
      if (res.meta.status !== 201) {
        return this.$message.error('添加商品失败!')
      }

      // 请求成功
      this.$message.success('添加商品成功!')
      this.$router.push('goods/add')
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    },
    selectedCateKeys() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat.join(',')
      }
      return ''
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.confirmBtn {
  margin-top: 15px;
}
</style>