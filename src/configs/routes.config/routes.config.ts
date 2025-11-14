import { lazy } from "react";
import authRoute from "./authRoute";
import type { Routes } from "@/@types/routes";

export const publicRoutes: Routes = [...authRoute];

export const protectedRoutes = [
  {
    key: "homePage",
    path: "/home",
    component: lazy(() => import("@/views/Home")),
    authority: [],
  },
  {
    key: "header",
    path: "/header",
    component: lazy(() => import("@/views/Header")),
    authority: [],
  },
  {
    key: "footer",
    path: "/footer",
    component: lazy(() => import("../../views/Footer")),
    authority: [],
  },
  {
    key: "aboutUsPage",
    path: "/about-group",
    component: lazy(() => import("@/views/AboutUs")),
    authority: [],
  },
  {
    key: "ourSpecialties",
    path: "/our-specialties",
    component: lazy(() => import("@/views/OurSpecialties")),
    authority: [],
  },
  {
    key: "childrenMenuDisplay",
    path: "/menu/:menuId",
    component: lazy(() => import("@/views/ChildrenMenuDisplay")),
    authority: [],
  },
  {
    key: "grandchildMenuDisplay",
    path: "/grandchild/:menuId",
    component: lazy(() => import("@/views/GrandchildMenuDisplay")),
    authority: [],
  },
  {
    key: "internationalPatientPage",
    path: "/international-patient",
    component: lazy(() => import("@/views/InternationalPatient")),
    authority: [],
  },
  {
    key: "careersPage",
    path: "/careers",
    component: lazy(() => import("@/views/Careers")),
    authority: [],
  },
  {
    key: "whatsNewPage",
    path: "/whats-new",
    component: lazy(() => import("@/views/WhatsNew")),
    authority: [],
  },
  {
    key: "contactUsPage",
    path: "/contact-us",
    component: lazy(() => import("@/views/ContactUs")),
    authority: [],
  },
  {
    key: "userProfile",
    path: "/user-profile",
    component: lazy(() => import("@/views/UserProfile")),
    authority: [],
  },
  {
    key: "logout",
    path: "/logout",
    component: lazy(() => import("@/views/Logout")),
    authority: [],
  },
  {
    key: "aboutUsMenuEdit",
    path: "/about-us-menu-edit",
    component: lazy(() => import("@/views/AboutUsMenuEdit")),
    authority: [],
  },
  {
    key: "menuEdit",
    path: "/menu-edit/:menuId",
    component: lazy(() => import("@/views/MenuEdit")),
    authority: [],
  },
  {
    key: "addNavigation",
    path: "/add-navigation",
    component: lazy(() => import("@/views/AddNavigation")),
    authority: [],
  },
  {
    key: "addSubmenu",
    path: "/add-submenu",
    component: lazy(() => import("@/views/AddSubmenu")),
    authority: [],
  },
  {
    key: "addGrandchild",
    path: "/add-grandchild",
    component: lazy(() => import("@/views/AddGrandchild")),
    authority: [],
  },
  {
    key: "pageCreate",
    path: "/page-create",
    component: lazy(() => import("../../views/PageCreate")),
    authority: [],
  },
];
