<template>
  <div>
    <!-- 导航面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card shadow="hover">
      <!-- 搜索与添加区域 --> 
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="userList" stripe>
        <el-table-column type="index" label=""></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editFormShow(scope.row.id)"></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUserById(scope.row.id)"></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10]"
        background
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      center
      @close="addFormClosed">
      <!-- 内容主体区域 -->
      <el-form ref="addFormRef" :model="addForm" label-width="80px" :rules="addFormRules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>  
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addUser">确 定</el-button>
        <el-button @click="addDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
      title="编辑用户"
      :visible.sync="editDialogVisible"
      width="50%"
      center
      @closed="editFormClosed">
      <!-- 内容主体区域 -->
      <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="editFormRules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editUser">确 定</el-button>
        <el-button @click="editDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="编辑用户"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      center
      @close="setRoleDialogClosed">
      <el-form ref="setRoleFormRef" :model="userInfo" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userInfo.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="role_name">
          <el-input v-model="userInfo.role_name" disabled></el-input>
        </el-form-item>
        <el-form-item label="分配新角色">
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if(regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if(regMobile.test(value)) {
        // 合法的手机号
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        // 搜索关键字
        query: '',
        // 当前页面
        pagenum: 1,
        // 每页数据条数
        pagesize: 5
      },
      // 用户列表数据
      userList: [],
      // 用户总数量
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 控制编辑用户对话框的显示与隐藏
      editDialogVisible: false,
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editForm: {
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3-10位之间', trigger: 'blur'}
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在6-15位之间', trigger: 'blur'}
        ],
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          { required: true, message: '请输入用户手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur'}
        ]
      },
      editFormRules: {
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          { required: true, message: '请输入用户手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur'}
        ]
      },
      // 用户信息
      userInfo: {},
      // 权限列表
      roleList: [],
      // 已选中的角色id
      selectedRoleId: ''
    }
  },
  methods: {
    // 获取用户数据列表
    async getUserList() {
      const { data: res } = await this.$http.get('users', { 
        params: this.queryInfo 
      })
      // console.log(res);
      if(res.meta.status !== 200) return this.$message.error("获取用户列表失败")
      this.userList = res.data.users
      this.total = res.data.total
      // console.log(this.total);
    },
    // 处理每页数据量变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 处理当前页码变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 用户状态变化
    async userStateChanged(state) {
      const { data: res } = await this.$http.put(`users/${state.id}/state/${state.mg_state}`)
      if( res.meta.status !== 200) {
        state.mg_state = !state.mg_state
        return this.$message.error("更新用户状态失败")
      }
      return this.$message.success("更新用户状态成功")
    },
    // 监听添加用户对话框的关闭事件
    addFormClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 监听编辑用户对话框的关闭事件
    editFormClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮,添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return
        // 发起添加用户的请求
        const { data:res } = await this.$http.post('users', this.addForm)
        if(res.meta.status !== 200) {
          this.$message.error("添加用户失败!")
        }
        this.$message.success("添加用户成功!")
        // 隐藏添加用户的对话框
        this.addDialogVisible = false
        // 重新获取用户列表数据
        this.getUserList()
      })
    },
    // 点击按钮,用户
    editUser() {
      // 修改信息预验证
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return
        // 发起修改用户信息的请求
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if(res.meta.status !== 200 ) {
          return this.$message.error('更新用户信息失败!')
        }
        // 关闭编辑用户信息对话框
        this.editDialogVisible = false
        // 刷新用户列表数据
        this.getUserList()
        // 提示成功更新
        this.$message.success('更新用户信息成功!')
      })
    },
    // 点击按钮，弹出编辑对话框
    async editFormShow(id) {
      // 从数据库获取数据更加安全，页面数据可能被篡改过
      const { data: res } = await this.$http.get('users/' + id)
      if(res.meta.status !== 200) {
        return this.$message.error('查询用户失败')
      }
      this.editForm = res.data
      // 弹出编辑对话框
      this.editDialogVisible = true
    },
    // 弹出删除用户对话框
    async deleteUserById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除用户数据，是否继续？',
        '提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户确认删除则confirmRusult = 'confirm'
      if(confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作!')
      }
      // 确认删除用户
      const { data: res } =  await this.$http.delete(`users/${id}`)
      if(res.meta.status !== 200) {
        return this.$message.error('删除用户数据失败!')
      }
      // 提示删除操作成功
      this.$message.success('删除用户数据成功!')
      // 刷新用户数据表
      this.getUserList()
    },
    // 展示分配角色的对话框
    async setRole(user) {
      this.userInfo = user
      // console.log(this.userInfo);
      
      // 在展示对话框之前，获取所有的角色列表
      const { data: res } = await this.$http.get('roles')
      if(res.meta.status !==200) {
        return this.$message.error('请求角色列表失败!')
      }
      this.roleList = res.data
      // console.log(this.roleList);
      
      this.setRoleDialogVisible = true
    },
    // 点击按钮，分配角色
    async saveRoleInfo() {
      if(!this.selectedRoleId) {
        return this.$message.info('请选择要分配的新角色!')
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`, 
        {
          rid: this.selectedRoleId
        })
        // console.log(res);
        
      if(res.meta.status !== 200 && res.meta.status !== 400) {
        return this.$message.error('分配角色请求失败!')
      }else if(res.meta.status == 400) {
        return this.$message.error('不允许修改admin账户!')
      }
      this.$message.success('分配角色请求成功!')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 关闭分配角色对话框
    setRoleDialogClosed() {
      this.selectedRoleId = ''
    }
  },
  created() {
    this.getUserList()
  }
}
</script>

<style lang="less" scoped>

</style>