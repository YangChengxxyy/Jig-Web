import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true,
    meta: { role: ['naive', 'high', 'supervisor', 'manager', 'admin'] }
  },
  {
    path: '/',
    component: Layout,
    hidden: true
  }
]
// 404 page must be placed at the end !!!
export const permissionRouter = [
  /*
naive
 */
  {
    path: '/jig-out-in',
    component: Layout,
    redirect: '/jig-out-in/out',
    meta: { title: '工夹具出入库', icon: 'out-in', role: ['naive'] },
    children: [
      {
        name: 'naive',
        path: 'out',
        component: () => import('@/views/naive/jig-out-in/out/index'),
        meta: { title: '工夹具出库', role: ['naive'] }
      },
      {
        path: 'in',
        component: () => import('@/views/naive/jig-out-in/in/index'),
        meta: { title: '归还工夹具', role: ['naive'] }
      }
    ]
  },
  {
    path: '/warehouse',
    component: Layout,
    redirect: '/warehouse/check',
    meta: { title: '仓库管理', icon: 'warehouse', role: ['naive'] },
    children: [
      {
        path: 'check',
        component: () => import('@/views/naive/warehouse/check/index'),
        meta: { title: '检点工夹具', role: ['naive'] }
      },
      {
        path: 'search',
        component: () => import('@/views/naive/warehouse/search/index'),
        meta: { title: '归还工夹具', role: ['naive'] }
      }
    ]
  },
  {
    path: '/repair',
    component: Layout,
    redirect: '/repair/index',
    meta: { title: '报修管理', icon: 'repair', role: ['naive'] },
    children: [
      {
        path: 'check',
        component: () => import('@/views/naive/repair/index/index'),
        meta: { title: '我的报修', role: ['naive'] }
      },
      {
        path: 'search',
        component: () => import('@/views/naive/repair/history/index'),
        meta: { title: '历史报修记录', role: ['naive'] }
      }
    ]
  },
  /*
high
 */
  {
    path: '/purchase',
    component: Layout,
    redirect: '/purchase/my',
    meta: { title: '采购管理', icon: 'purchase', role: ['high'] },
    children: [
      {
        name: 'high',
        path: 'my',
        component: () => import('@/views/high/purchase/my/index'),
        meta: { title: '我的采购单', role: ['high'] }
      },
      {
        path: 'history',
        component: () => import('@/views/high/purchase/history/index'),
        meta: { title: '历史采购记录', role: ['high'] }
      }
    ]
  },
  {
    path: '/repair',
    component: Layout,
    redirect: '/repair/my',
    meta: { title: '报修管理', icon: 'repair', role: ['high'] },
    children: [
      {
        path: 'my',
        component: () => import('@/views/high/repair/my/index'),
        meta: { title: '我的报修审核', role: ['high'] }
      },
      {
        path: 'history',
        component: () => import('@/views/high/repair/history/index'),
        meta: { title: '历史采购记录', role: ['high'] }
      },
      {
        path: 'statistics',
        component: () => import('@/views/high/repair/statistics/index'),
        meta: { title: '报修统计', role: ['high'] }
      }
    ]
  },
  {
    path: '/scrap',
    component: Layout,
    redirect: '/scrap/my',
    meta: { title: '报废管理', icon: 'scrap', role: ['high'] },
    children: [
      {
        path: 'my',
        component: () => import('@/views/high/scrap/my/index'),
        meta: { title: '我的报废申请', role: ['high'] }
      },
      {
        path: 'history',
        component: () => import('@/views/high/repair/history/index'),
        meta: { title: '历史报废记录', role: ['high'] }
      }
    ]
  },
  {
    path: '/jig-information',
    component: Layout,
    redirect: '/jig-information/index',
    meta: { title: '工夹具信息管理', icon: 'jig', role: ['high'] },
    children: [
      {
        path: 'index',
        component: () => import('@/views/naive/warehouse/search/index'),
        meta: { title: '工夹具信息', role: ['high'] }
      }
    ]
  },
  /*
supervisor
 */
  {
    path: '/jig-information',
    component: Layout,
    redirect: '/jig-information/index',
    meta: { title: '工夹具信息管理', icon: 'jig', role: ['supervisor'] },
    children: [
      {
        name: 'supervisor',
        path: 'index',
        component: () => import('@/views/supervisor/jig-information/index/index'),
        meta: { title: '工夹具信息', role: ['supervisor'] }
      }
    ]
  },
  {
    path: '/purchase',
    component: Layout,
    redirect: '/purchase/approve',
    meta: { title: '采购管理', icon: 'purchase', role: ['supervisor'] },
    children: [
      {
        path: 'approve',
        component: () => import('@/views/supervisor/purchase/approve/index'),
        meta: { title: '采购审批', role: ['supervisor'] }
      },
      {
        path: 'history',
        component: () => import('@/views/supervisor/purchase/history/index'),
        meta: { title: '历史采购记录', role: ['supervisor'] }
      }
    ]
  },
  {
    path: '/scrap',
    component: Layout,
    redirect: '/scrap/my',
    meta: { title: '报废管理', icon: 'scrap', role: ['supervisor'] },
    children: [
      {
        path: 'my',
        component: () => import('@/views/supervisor/scrap/my/index'),
        meta: { title: '待处理报废申请', role: ['supervisor'] }
      },
      {
        path: 'history',
        component: () => import('@/views/supervisor/scrap/history/index'),
        meta: { title: '历史报废记录', role: ['supervisor'] }
      }
    ]
  },
  /*
manager
 */
  {
    path: '/purchase',
    component: Layout,
    redirect: '/purchase/my',
    meta: { title: '采购管理', icon: 'purchase', role: ['manager'] },
    children: [
      {
        name: 'manager',
        path: 'my',
        component: () => import('@/views/manager/purchase/my/index'),
        meta: { title: '采购审批', role: ['manager'] }
      },
      {
        path: 'history',
        component: () => import('@/views/manager/purchase/history/index'),
        meta: { title: '历史采购记录', role: ['manager'] }
      }
    ]
  },
  {
    path: '/scrap',
    component: Layout,
    redirect: '/scrap/my',
    meta: { title: '报废管理', icon: 'scrap', role: ['manager'] },
    children: [
      {
        path: 'my',
        component: () => import('@/views/manager/scrap/my/index'),
        meta: { title: '报废审批', role: ['manager'] }
      },
      {
        path: 'history',
        component: () => import('@/views/manager/scrap/history/index'),
        meta: { title: '历史报废记录', role: ['manager'] }
      }
    ]
  },
  {
    path: '/jig',
    component: Layout,
    redirect: '/jig/index',
    meta: { role: ['manager'] },
    children: [
      {
        path: 'index',
        component: () => import('@/views/manager/jig/information/index'),
        meta: { title: '工夹具信息', icon: 'jig', role: ['manager'] }
      }
    ]
  },
  /*
  admin
  */
  {
    name: 'admin',
    path: '/information',
    component: Layout,
    redirect: '/information/index',
    meta: { title: '人员管理', icon: 'user', role: ['admin'] },
    children: [
      {
        path: 'index',
        component: () => import('@/views/admin/person/information/index'),
        meta: { title: '人员信息管理', role: ['admin'] }
      }
    ]
  },
  {
    path: '/jig',
    component: Layout,
    redirect: '/jig/entity',
    meta: { title: '工夹具管理', icon: 'jig', role: ['admin'] },
    children: [
      {
        path: 'entity',
        component: () => import('@/views/admin/jig/entity/index'),
        meta: { title: '工夹具实体', role: ['admin'] }
      },
      {
        path: 'definition',
        component: () => import('@/views/admin/jig/definition/index'),
        meta: { title: '工夹具定义', role: ['admin'] }
      },
      {
        path: 'model',
        component: () => import('@/views/admin/jig/model/index'),
        meta: { title: '模组&料号信息', role: ['admin'] }
      }
    ]
  },
  {
    path: '/en-zh',
    component: Layout,
    redirect: '/en-zh/index',
    meta: { role: ['admin'] },
    children: [
      {
        path: 'index',
        component: () => import('@/views/admin/en-zh/index'),
        meta: { title: '中英字典', icon: 'book', role: ['admin'] }
      }
    ]
  },
  {
    path: '/report',
    component: Layout,
    redirect: '/report/use',
    meta: { title: '详细报表', icon: 'report', role: ['admin'] },
    children: [
      {
        path: 'use',
        component: () => import('@/views/admin/report/use/index'),
        meta: { title: '工夹具使用分析', role: ['admin'] }
      },
      {
        path: 'life',
        component: () => import('@/views/admin/report/life/index'),
        meta: { title: '工夹具寿命以及损坏分析', role: ['admin'] }
      },
      {
        path: 'manufacturer',
        component: () => import('@/views/admin/report/manufacturer/index'),
        meta: { title: '厂商统计分析', role: ['admin'] }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true, meta: { role: ['naive', 'high', 'supervisor', 'manager', 'admin'] }}
]
const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

/**
 * 各个用户的首页
 * @type {{high: string, manager: string, admin: string, naive: string, supervisor: string}}
 */
export const roleMap = {
  naive: '/jig-out-in',
  high: '/purchase',
  supervisor: '/jig-information',
  manager: '/purchase',
  admin: '/information'
}
export default router
