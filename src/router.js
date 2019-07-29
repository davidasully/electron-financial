import Vue from 'vue'
import Router from 'vue-router'
import Home from './components/Home'
import Pivot from './components/PivotView'
import Person from './components/Person'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/pivot',
      name: 'pivot',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: Pivot
    },
    {
      path: '/person/:posid',
      name: 'person',
      component: Person,
      props: true
    }
  ]
})
