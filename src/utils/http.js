import axios from 'axios'

// 设置请求基准路径
axios.defaults.baseURL = 'http://live.com:8081'
// axios.defaults.baseURL = 'https://wanjiahao.site:8082'
axios.defaults.withCredentials = true

// url中可以直接传入 axios.get('/user?ID=12345)
// axios.get('/user', {params: {ID: 12345}})也可以传入对象 params: {}
export const Get = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    axios.get(url, {params})
      .then(({data}) => {
        resolve(data)
      })
      .catch(e => {
        reject(e)
      })
  })
}

// 构造post请求 axios.post(url, {id: xxx, name: xxx})
export const Post = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    axios.post(url, params)
      .then(({data}) => {
        resolve(data)
      })
      .catch(e => {
        reject(e)
      })
  })
}
