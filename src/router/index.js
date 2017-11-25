import Vue from 'vue'
import Router from 'vue-router'
import LabelObjectDetectionPage from '../pages/labeling_for_object_detection_page/page.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {path: '/', name: 'ObjectDetectionLabeling', component: LabelObjectDetectionPage}
  ]
})
