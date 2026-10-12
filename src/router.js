import { createRouter, createWebHistory } from "vue-router";
import { auth } from "./store";
import Landing from "./views/Landing.vue";
import Login from "./views/Login.vue";
import Register from "./views/Register.vue";
import AppLayout from "./layouts/AppLayout.vue";
import Dashboard from "./views/Dashboard.vue";
import EquipmentList from "./views/EquipmentList.vue";
import EquipmentDetail from "./views/EquipmentDetail.vue";
import Rooms from "./views/Rooms.vue";
import Users from "./views/Users.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public routes
    { path: "/", name: "landing", component: Landing, meta: { title: "Welcome" } },
    { path: "/login", name: "login", component: Login, meta: { title: "Sign In" } },
    { path: "/register", name: "register", component: Register, meta: { title: "Register" } },

    // Everything below needs a signed-in user and shares the navbar layout
    {
      path: "/",
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: "dashboard", name: "dashboard", component: Dashboard, meta: { title: "Dashboard" } },
        { path: "equipment", name: "equipment", component: EquipmentList, meta: { title: "Equipment" } },
        {
          path: "equipment/:id",
          name: "equipment-detail",
          component: EquipmentDetail,
          props: true, // the :id param arrives as a prop
          meta: { title: "Equipment details" },
        },
        // Admin-only pages
        { path: "rooms", name: "rooms", component: Rooms, meta: { roles: ["admin"], title: "Rooms" } },
        { path: "users", name: "users", component: Users, meta: { roles: ["admin"], title: "Users" } },
      ],
    },

    // Anything unknown goes back to the landing page
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
  scrollBehavior: () => ({ top: 0 }),
});

// Navigation guard: sign-in required + role check
router.beforeEach((to) => {
  // If already authenticated and trying to go to login or register, go to dashboard
  if ((to.name === "login" || to.name === "register") && auth.user) {
    return { path: "/dashboard" };
  }

  // If requires auth and user is not authenticated, redirect to login
  if (to.matched.some((r) => r.meta.requiresAuth) && !auth.user) {
    return { path: "/login" };
  }

  const roleRule = to.matched.find((r) => r.meta.roles);
  if (roleRule && !roleRule.meta.roles.includes(auth.user?.role)) {
    return { path: "/dashboard" };
  }
  return true;
});

router.afterEach((to) => {
  document.title = `${to.meta.title ? to.meta.title + " · " : ""}Equipment Maintenance Log System`;
});

export default router;
