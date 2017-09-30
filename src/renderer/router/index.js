import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
	routes: [
		{
			path: '/',
			name: 'landing-page',
			component: require('@/pages/LandingPage').default
		},
		{
			path: '/simple',
			name: 'simple-maker',
			component: require('@/pages/SimpleMaker').default
		},
		{
			path: '/advance',
			name: 'advance-maker',
			component: require('@/pages/AdvanceMaker').default
		}
	]
})
