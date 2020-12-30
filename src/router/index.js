import Vue from 'vue'
import Router from 'vue-router'
import Register from '@/views/Register'
import LiveHall from '@/views/LiveHall'
import Live from '@/views/Live'
import Reset from '@/views/Reset'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/',
      name: 'LiveHall',
      component: LiveHall
    },
    {
      path: '/live',
      name: 'Live',
      component: Live
    },
    {
      path: '/reset',
      name: 'Reset',
      component: Reset
    }
  ]
})
