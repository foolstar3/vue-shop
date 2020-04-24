<template>
  <el-container class="home-container">
      <!-- 头部区域 -->
      <el-header>
          <img src="../assets/logo.png" alt="">
          <span>电商后台管理系统</span>
          <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <!-- 页面主体区域 -->
      <el-container>
          <!-- 侧边栏 -->
        <el-aside :width="isCollapse ? '64px' : '200px'">
            <!-- 侧边栏菜单区域 -->
            <div class="toggle" @click="toggleCollapse">|||</div>
            <el-menu background-color="#333744" 
                     text-color="#fff" 
                     active-text-color="#409bff" 
                     :unique-opened="true" 
                     :collapse="isCollapse" 
                     :collapse-transition="false"
                     :router="true"
                     :default-active="$route.path">
                <!-- 一级菜单 -->
                <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">              
                    <!-- 一级菜单的模板区域 -->
                    <template slot="title">
                        <!-- 图标 -->
                        <i :class="iconObj[item.id]"></i>
                        <!-- 文本 -->
                        <span>{{item.authName}}</span>
                    </template>
                    <!-- 二级菜单 -->
                    <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
                        <!-- 二级菜单的模板区域 -->
                        <template slot="title">
                        <!-- 图标 -->
                        <i class="el-icon-location"></i>
                        <!-- 文本 -->
                        <span>{{subItem.authName}}</span>
                    </template>
                    </el-menu-item>
                </el-submenu>
            </el-menu>
        </el-aside>
        <!-- 页面内容区域 -->
        <el-main>
            <router-view></router-view>
        </el-main>
      </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
      return {
          menuList: [],
          iconObj: {
              '125': 'iconfont icon-account',
              '103': 'iconfont icon-jizhuangxiang',
              '101': 'iconfont icon-product',
              '102': 'iconfont icon-shenqingjilu',
              '145': 'iconfont icon-tradingdata'
          },
          isCollapse: false
      }
  },
  methods: {
    logout() {
      // 清除sessionStorage中的token
      window.sessionStorage.clear();
      // 返回登录页
      this.$router.push("/login");
    },
    //点击切换导航坍塌
    toggleCollapse() {
        this.isCollapse = !this.isCollapse
    },
    // 获取所有的菜单
    async getMenuList() {
        const { data: res} = await this.$http.get('menus')
        if ( res.meta.status != 200) return this.$message.error(res.meta.msg)
        this.menuList = res.data
    }
  },
  created() {
      this.getMenuList()
  }
};
</script>

<style lang="less" scoped>
.home-container {
    height: 100%;
}
.el-header {
    background: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    img {
        width: 60px;
        height: 60px;
    }
}
.el-aside {
    background: #333744;
    .el-menu {
        border-right: none;
    }
}
.el-main {
    background: #eaedf1;
}
.iconfont {
    margin-right: 10px;
}
.toggle {
    background: #4a5064;
    color: white;
    letter-spacing: .2em;
    text-align: center;
    font-size: 10px;
    line-height: 24px;
    cursor: pointer;
}
</style>