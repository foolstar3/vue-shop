<template>
  <div>
    <h1>首页</h1>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      // 清除sessionStorage中的token
      window.sessionStorage.clear();
      // 返回登录页
      this.$router.push("/login");
    }
  }
};
</script>

<style>
</style>