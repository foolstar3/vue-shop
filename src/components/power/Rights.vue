<template>
  <div>
    <!-- 卡片视图 -->
    <el-card shadow="hover">
        <el-table :data="rightsList" stripe border>
            <el-table-column type="index" label=""></el-table-column>
            <el-table-column prop="authName" label="权限名称"></el-table-column>
            <el-table-column prop="path" label="路径"></el-table-column>
            <el-table-column prop="level" label="权限等级">
                <template v-slot="scope">
                    <el-tag v-if="scope.row.level == 0">一级</el-tag>
                    <el-tag type="success" v-else-if="scope.row.level == 1">二级</el-tag>
                    <el-tag type="warning" v-else-if="scope.row.level == 2">三级</el-tag>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
    data() {
        return {
            // 权限列表
            rightsList: []
        }
    },
    methods: {
        // 获取权限列表
        async getRightsList() {
            const { data: res } = await this.$http.get('rights/list')
            if(res.meta.status !== 200) {
                return this.$message.error('请求权限列表失败!')
            }
            // console.log(res.data);
            this.rightsList = res.data
        }
    },
    created() {
        // 获取所有的权限
        this.getRightsList()
    }
}
</script>

<style>

</style>