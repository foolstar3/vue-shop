<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <img src="../assets/logo.png" alt />
      <span>电商后台管理系统</span>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 侧边栏菜单区域 -->
        <div class="toggle" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409bff"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="$route.path"
        >
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
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
            >
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
        <!-- 导航面包屑 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-if="!isWelcome">{{breadcrumbNames.firstListName}}</el-breadcrumb-item>
          <el-breadcrumb-item v-if="!isWelcome">{{breadcrumbNames.secondListName}}</el-breadcrumb-item>
        </el-breadcrumb>
				<!-- 页面主体区域 -->
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
        "125": "iconfont icon-account",
        "103": "iconfont icon-jizhuangxiang",
        "101": "iconfont icon-product",
        "102": "iconfont icon-shenqingjilu",
        "145": "iconfont icon-tradingdata"
      },
      isCollapse: false,
      // 当前页面的面包屑导航名称
      breadcrumbNames: {
        firstListName: "",
        secondListName: ""
			},
			// 判断是否在welcome页
			isWelcome: true
    };
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
      this.isCollapse = !this.isCollapse;
    },
    // 获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status != 200) return this.$message.error(res.meta.msg);
      this.menuList = res.data;
      // console.log('menulist');
      this.$nextTick(this.getBreadcrumb())
      
    },
    // 获取面包屑导航名称
    getBreadcrumb() {
      // console.log('breadcrumb');
      // console.log(this.menuList);
      
      // 判断当前路径对应的面包屑名称
      this.menuList.forEach(item => {
        item.children.forEach(subItem => {
          // subItem中的path不带/,而to.path则带有/
          // 将两者转为同样的形式
          if ("/" + subItem.path === this.$route.path) {
            // console.log(item,subItem);
            // 将面包屑导航名保存
            this.breadcrumbNames.firstListName = item.authName;
            this.breadcrumbNames.secondListName = subItem.authName;
          }
        });
      });
      // console.log(this.breadcrumbNames);
      
    }
  },
  created() {
    this.getMenuList()
    // this.getBreadcrumb()
	},
	// 此时路由数据
	beforeRouteUpdate(to, from, next) {
		// 每次跳转路由更新前时将
		if (to.path === '/welcome') {
			next()
			return this.isWelcome = true
		} else if (to.path === '/goods/add') {
			next()
			return this.breadcrumbNames.secondListName = '添加商品'
		}
		// 判断当前路径对应的面包屑名称
		this.menuList.forEach(item => {
			item.children.forEach(subItem => {
				// subItem中的path不带/,而to.path则带有/
				// 将两者转为同样的形式
				if ("/" + subItem.path === to.path) {
					// console.log(item,subItem);
					// 将面包屑导航名保存
					this.breadcrumbNames.firstListName = item.authName;
					this.breadcrumbNames.secondListName = subItem.authName;
				}
			});
		});
		this.isWelcome = false
		next()
	},
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
  letter-spacing: 0.2em;
  text-align: center;
  font-size: 10px;
  line-height: 24px;
  cursor: pointer;
}
</style>