import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

// 导入nprogress进度条
import nprogress from 'nprogress'

// 导入全局样式表
import './assets/css/global.css'

// 导入iconfont
import './assets/font/iconfont.css'

// 导入axios
import axios from 'axios'

// 配置请求的根路径
// axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios拦截器对url(request)请求的config数据进行预处理
axios.interceptors.request.use(config => {
  // 请求开始，显示进度条
  nprogress.start()
  // 为请求头对象，添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 必须返回config
  return config
})
// axios拦截器对url(response)响应的config数据进行预处理
axios.interceptors.response.use(config => {
  // 请求完成，开始响应，关闭进度条
  nprogress.done()
  // 必须返回config
  return config
})
// 将axios加入vue原型中
Vue.prototype.$http = axios

// 添加全局过滤器
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal*1000)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})


Vue.use(VueQuillEditor)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
