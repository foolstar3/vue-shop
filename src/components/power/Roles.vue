<template>
  <div>
    <!-- 卡片视图 -->
    <el-card shadow="hover">
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="roleList" stripe border>
        <!-- 扩展列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row :class="['bdbottom', index === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item,index) in scope.row.children" :key="item.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="deleteRightById(scope.row, item.id)">{{item.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环，嵌套渲染二级权限 -->
                <el-row :class="[index2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2,index2) in item.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="deleteRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 通过for循环，嵌套渲染三级权限 -->
                      <el-tag v-for="item3 in item2.children" :key="item3.id" type="warning" closable @close="deleteRightById(scope.row, item3.id)">
                        {{item3.authName}}
                      </el-tag>
                  </el-col>
                </el-row>
              </el-col>
              </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editFormShow(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRoleById(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      center
      @close="addFormClosed">
      <!-- 内容主体区域 -->
      <el-form ref="addFormRef" :model="addForm" label-width="80px" :rules="addFormRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addRole">确认</el-button>
        <el-button @click="addDialogVisible = false">取消</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色信息框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editDialogVisible"
      width="50%"
      center
      @close="editFormClosed">
      <!-- 内容主体区域 -->
      <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="editFormRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="editRole">确定</el-button>
        <el-button @click="editDialogVisible = false">取消</el-button>
      </span>
    </el-dialog>

    <!-- 设置权限对话框 -->
    <el-dialog
      title="设置权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      center
      @close="setRightDialogClosed">
      <!-- 树形控件区域 -->
      <el-tree
        :data="allRightsList"
        show-checkbox
        node-key="id"
        :default-checked-keys="defKeys"
        default-expand-all
        :props="treeProps"
        ref="treeRef">
      </el-tree>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="allotRight">确定</el-button>
        <el-button @click="setRightDialogVisible = false">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色数据
      roleList: [],
      // 添加角色对话框显示与隐藏
      addDialogVisible: false,
      // 编辑角色对话框显示与隐藏
      editDialogVisible: false,
      // 设置权限对话框显示与隐藏
      setRightDialogVisible: false,
      // 添加对话框的验证规则
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur'},
          { min: 3, max: 15, message: '长度在3-15位之间', trigger: 'blur'}
        ]
      },
      // 编辑对话框的验证规则
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur'},
          { min: 3, max: 15, message: '长度在3-15位之间', trigger: 'blur'}
        ]
      },
      // 添加对话框的数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 编辑对话框的数据
      editForm: {
        roleName: '',
        roleDesc: '',
        roleId:  0
      },
      // 所有权限列表
      allRightsList: [],
      // 树形图属性绑定
      treeProps: {
        // 标签名为authName
        label: 'authName',
        // 子项为children
        children: 'children'
      },
      // 默认勾选的权限id
      defKeys: [],
      // 当前进行权限设置的角色id
      roleId: ''
    }
  },
  methods: {
    // 获取所有角色数据列表
    async getRoleList() {
      const { data: res } = await this.$http.get('/roles')
      if(res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败!")
      }
      this.roleList = res.data
      // console.log(this.roleList);
    },
    // 关闭添加角色对话框后重置内容
    addFormClosed() {
      this.$refs.addFormRef.resetFields()
      this.addForm.roleName = ''
      this.addForm.roleDesc = ''
    },
    // 关闭编辑角色对话框后重置内容
    editFormClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮添加新角色
    addRole() {
      // 添加角色的信息预验证
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return
        // 验证通过
        const { data: res } = await this.$http.post('roles', this.addForm)
        if(res.meta.status !== 201) {
          return this.$message.error('添加角色失败!')
        }
        // 关闭添加角色对话框
        this.addDialogVisible = false
        // 清空addForm数据源
        this.addForm.roleName = ''
        this.addForm.roleDesc = ''
        // 刷新角色列表
        this.getRoleList()
        // 提示添加角色成功
        this.$message.success('添加角色成功!')
      })
    },
    // 点击按钮编辑角色
    async editRole() {
      // 发送请求前预验证
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return
        //通过验证则发送请求
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        if(res.meta.status !== 200) {
          return this.$message.error('修改角色信息失败!')
        }
        //请求成功
        // 关闭编辑角色对话框
        this.editDialogVisible = false
        // 刷新角色数据列表
        this.getRoleList()
        // 提示修改角色信息成功
        this.$message.success('修改角色信息成功!')
      })
    },
    // 通过角色id删除用户
    async deleteRoleById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除角色数据，是否继续？',
        '提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 取消删除操作
      if(confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作')
      }
      // 发起删除请求
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if(res.meta.status !== 200) {
        return this.$message.error('删除角色失败!')
      }
      // 刷新角色数据列表
      this.getRoleList()
      // 提示删除角色成功
      this.$message.success('删除角色成功!')
    },
    // 点击按钮，弹出编辑对话框
    async editFormShow(id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if(res.meta.status !== 200) {
        return this.$message.error('请求角色数据失败!')
      }
      // 将请求的数据赋值给editForm
      this.editForm = res.data
      // 弹出编辑角色框
      this.editDialogVisible = true
    },
    // 弹出取消权限对话框
    async deleteRightById(role,rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久取消该权限，是否继续？',
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
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if(res.meta.status !== 200) {
        return this.$message.error('取消权限失败!')
      }
      // 提示删除操作成功
      this.$message.success('取消权限成功!')
      // 更新角色权限
      role.children = res.data
    },
    // 展示设置权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限列表内容
      const { data: res } = await this.$http.get('rights/tree')
      if(res.meta.status !== 200) {
        return this.$message.error('请求权限列表失败!')
      }
      this.allRightsList = res.data
      // 递归获取该角色的三级权限id
      this.getLeafKeys(role,this.defKeys)
      // 弹出设置权限对话框
      this.setRightDialogVisible = true
    },
    // 获取子节点id
    getLeafKeys(node,arr) {
      // 如果当前node节点不含children属性,则是三级节点
      if(!node.children) {
        return arr.push(node.id)
      }
      // 否则进行递归,直到无子节点
      node.children.forEach(item => {
        this.getLeafKeys(item,arr)
      })
    },
    // 关闭设置权限对话框时,重置角色三级权限数组
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 点击分配权限
    async allotRight() {
      // 获取所有勾选节点id
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 将数组转换成id字符串
      const idStr = keys.join(',')
      // console.log(idStr);
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`, 
        { rids: idStr}
      )
      if(res.meta.status !== 200) {
        return this.$message.error('设置权限请求失败!')
      }
      // 提示成功
      this.$message.success('设置权限请求成功!')
      // 刷新角色权限列表
      this.getRoleList()
      // 关闭设置权限对话框
      this.setRightDialogVisible = false
    }
  },
  created() {
    this.getRoleList()
  }
}
</script>

<style lang="less" scoped>
.el-tag{
  margin: 8px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>