<template>
    <div>
        <!-- 卡片视图区域 -->
        <el-card shadow="hover">
            <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>

            <!-- 表格 -->
            <el-table :data="cateList" stripe row-key="cat_id" border :tree-props="{children: 'children', hasChildren: 'hasChlidren'}">
                <el-table-column type="index" label="">
                    <template v-slot="scope">
                        <span>
                            {{scope.row.id}} 
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="cat_name" label="分类名称"></el-table-column>
                <el-table-column prop="cat_deleted" label="是否有效">
                    <template v-slot="scope">
                        <i v-if="!scope.row.cat_deleted" class="el-icon-success" style="color: lightgreen"></i>
                        <i v-else class="el-icon-error" style="color: red"></i>
                    </template>
                </el-table-column>
                <el-table-column prop="cat_level" label="分类当前层级">
                    <template v-slot="scope">
                        <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                        <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
                        <el-tag v-else-if="scope.row.cat_level === 2" type="warning">三级</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template v-slot="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCateDialogShow(scope.row)">编辑</el-button>
                        <el-button type="danger"  icon="el-icon-delete" size="mini" @click="deleteCateById(scope.row.cat_id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[3, 5, 10, 15]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>

            <!-- 添加分类对话框 -->
            <el-dialog
              title="添加分类"
              center
              :visible.sync="addCateDialogVisible"
              width="50%"
              @close="addCateDialogClosed"
            >
                <!-- 添加分类的表单主体内容 -->
                <el-form :model="addCateForm" label-width="80px" :rules="addFormRules" ref="addCateFormRef">
                    <el-form-item prop="cat_name" label="分类名称" label-width="80px">
                        <el-input v-model="addCateForm.cat_name"></el-input>
                    </el-form-item>
                    <el-form-item label="父级分类">
                        <el-cascader
                            v-model="selectedParentCateId"
                            :options="parentCateList"
                            :props="parentCateProps"
                            @change="parentCateChanged"
                            clearable>
                        </el-cascader>
                    </el-form-item>
                </el-form>
                <!-- 底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="addCate">确定</el-button>
                    <el-button @click="addCateDialogVisible = false">取消</el-button>
                </span>
            </el-dialog>

            <!-- 编辑分类对话框 -->
            <el-dialog
              title="编辑分类"
              center
              :visible.sync="editCateDialogVisible"
              width="50%"
              @close="editCateDialogClosed"
            >
                <el-form ref="editCateDialogRef" :model="editCateForm" :rules="editCateFormRules">
                    <el-form-item label="分类名称" prop="cat_name" label-width="80px">
                        <el-input v-model="editCateForm.cat_name"></el-input>
                    </el-form-item>
                </el-form>
                <!-- 底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="editCate">确定</el-button>
                    <el-button @click="editCateDialogVisible = false">取消</el-button>
                </span>
            </el-dialog>
        </el-card>
    </div>
</template>
<script>
export default {
    data() {
        return {
            // 请求参数
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            // 商品分配列表
            cateList: [],
            // 总数据条数
            total: 0,
            // 控制添加分类对话框隐藏与显示
            addCateDialogVisible: false,
            // 控制编辑分类对话框隐藏与显示
            editCateDialogVisible: false,
            // 添加分类的表单数据对象
            addCateForm: {
                // 将要添加的分类名称
                cat_name: '',
                // 将要添加的分类父id
                cat_pid: 0,
                // 分类的等级，默认添加的是1级分类
                cat_level: 0
            },
            // 编辑分类的表单数据对象
            editCateForm: {
                // 将要编辑的分类名称
                cat_name: '',
            },
            // 编辑表单的分类id
            editCateId: '',
            // 添加分类表单的验证规则对象
            addFormRules: {
                cat_name: 
                { required: true, message: '分类名称不能为空', trigger: 'blur'}
            },
            // 编辑分类表单的验证规则对象
            editCateFormRules: {
                cat_name: 
                { required: true, message: '分类名称不能为空', trigger: 'blur'}
            },
            // 所有父级分类
            parentCateList: [],
            // 选中的父级分类id数组
            selectedParentCateId: [],
            // 父级分类的属性
            parentCateProps: {
                label: 'cat_name',
                value: 'cat_id',
                children: 'children',
                expandTrigger: 'hover',
                checkStrictly: 'true'
            }
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        // 获取商品分类列表
        async getCateList() {
            const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
            if(res.meta.status !== 200) {
                return this.$message.error('获取商品分类失败!')
            }
            this.cateList = res.data.result
            this.total = res.data.total
            // console.log(this.cateList);
            // console.log(this.total);
        },
        // 处理每页数据量变化
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getCateList()
        },
        // 处理当前页码变化
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getCateList()
        },
        // 获取所有分类列表
        showAddCateDialog() {
            // 先获取父级分类的数据列表
            this.getParentCateList()
            // 弹出添加分类对话框
            this.addCateDialogVisible = true
        },
        // 获取父级分类
        async getParentCateList() {
            const { data: res } = await this.$http.get('categories', 
            { 
                type: 2 
            })
            if(res.meta.status !== 200) {
                return this.$message.error('获取父级分类失败!')
            }
            this.parentCateList = res.data
            // console.log(this.parentCateList);
        },
        // 父级分类发生变化
        parentCateChanged() {
            console.log(this.selectedParentCateId)
            // 如果selectedParentCateId数组中length大于0，证明选中了父级分类
            // 反之，就说明没有选中任何父级分类
            if(this.selectedParentCateId.length > 0) {
                // 父级分类的id
                this.addCateForm.cat_pid = this.selectedParentCateId.slice(-1)[0]
            }else {
                this.addCateForm.cat_pid = 0
            }
            // 为当前分类的等级赋值
            this.addCateForm.cat_level = this.selectedParentCateId.length
        },
        // 点击确定添加分类
        addCate() {
            this.$refs.addCateFormRef.validate(async valid => {
                if(!valid) return
                const { data: res } = await this.$http.post('categories', this.addCateForm)
                if(res.meta.status !== 201) {
                    return this.$message.error('添加分类失败!')
                }
                this.$message.success('添加分类成功!')
                this.getCateList()
                this.addCateDialogVisible = false
            })
        },
        // 监听关闭添加分类对话框事件，重置表单内容
        addCateDialogClosed() {
            // 重置cat_name
            this.$refs.addCateFormRef.resetFields()
            // 重置selectedParentCateId
            this.selectedParentCateId = []
            this.addCateForm.cat_pid = 0
            this.addCateForm.cat_level = 0
        },
        // 展示编辑分类对话框
        async editCateDialogShow(cate) {
            // 获取当前分类id
            this.editCateId = cate.cat_id
            // 发起分类数据请求
            const { data: res } = await this.$http.get(`categories/${this.editCateId}`)
            // 请求失败
            if(res.meta.status !== 200) {
                return this.$message.error('请求分类名称失败!')
            }
            this.editCateForm.cat_name = res.data.cat_name
            this.editCateDialogVisible = true
            // console.log(this.editCateId);
        },
        // 关闭编辑分类对话框事件触发表单重置
        editCateDialogClosed() {
            this.$refs.editCateDialogRef.resetFields()
        },
        // 点击确定编辑分类
        editCate() {
            this.$refs.editCateDialogRef.validate(async valid => {
                // 发送编辑分类请求前预验证
                if(!valid) return
                const { data: res } = await this.$http.put(`categories/${this.editCateId}`, 
                    {
                        cat_name: this.editCateForm.cat_name
                    }
                )
                // 请求失败
                if(res.meta.status !== 200) {
                    return this.$message.error('编辑分类失败!')
                }
                // 请求成功
                this.$message.success('编辑分类成功!')
                // 刷新分类表单
                this.getCateList()
                // 关闭编辑分类对话框
                this.editCateDialogVisible = false
            })
        },
        // 通过分类id删除指定分类
        async deleteCateById(id) {
            // 弹框提示是否删除
            const confirmResult = await this.$confirm(
                '此操作将永久删除该分类，是否继续？',
                '提示',
                {
                    confirmButtonText: '确认',
                    cancalButtonText: '取消',
                    type: 'warning'
                }
            ).catch(err => err)
            // 取消删除
            if(confirmResult !== 'confirm') {
                return this.$message.info('已取消删除操作!')
            }
            // 确认删除,发起请求
            const { data: res } = await this.$http.delete(`categories/${id}`)
            // 删除请求失败
            if(res.meta.status !== 200) {
                return this.$message.error('删除分类失败!')
            }
            // 提示删除成功
            this.$message.success('删除分类成功!')
            // 刷新分类列表
            this.getCateList()
        }
    }
}
</script>
<style lang="less" scoped>

</style>