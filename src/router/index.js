import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: "/login",
    component: resolve => require(['../components/Login.vue'],resolve)
  },
  {
    path: "/home",
    component: resolve => require(['../components/Home.vue'],resolve)
  }
]

const router = new VueRouter({
  routes
})

// 为路由对象添加路由导航守卫
router.beforeEach((to, from, next)=>{
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，放行
  // next() 放行，   next('/login')强制跳转

  // 如果用户访问的登录页，直接放行
  if ( to.path === '/login' ) return next()
  // 从sessionStorage中获取到保存的token值
  const tokenStr = window.sessionStorage.getItem('token');
  // 没有token，强制跳转到登录页
  if( !tokenStr ) return next('/login')
  next()
})
export default router
