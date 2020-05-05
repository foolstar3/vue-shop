import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)
const Login = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "Login_Home_Welcome" */ '../components/Welcome.vue')

const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/users/Users.vue')
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Roles.vue')

const Cate = () => import(/* webpackChunkName: "Cate_Add_Goods_Params" */ '../components/goods/Cate.vue')
const Add = () => import(/* webpackChunkName: "Cate_Add_Goods_Params" */ '../components/goods/Add.vue')
const Goods = () => import(/* webpackChunkName: "Cate_Add_Goods_Params" */ '../components/goods/Goods.vue')
const Params = () => import(/* webpackChunkName: "Cate_Add_Goods_Params" */ '../components/goods/Params.vue')

const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/Order.vue')
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/Report.vue')
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
    component: resolve => require(['../components/Home.vue'],resolve),
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: Goods },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
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
