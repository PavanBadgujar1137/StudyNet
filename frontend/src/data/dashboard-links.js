import { ACCOUNT_TYPE } from "../utils/constants"

export const sidebarLinks = [
  // 1. My Courses (Instructor / Student)
  {
    id: 3,
    name: "My Courses",
    path: "/dashboard/my-courses",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscVm",
  },
  {
    id: 5,
    name: "My Courses",
    path: "/dashboard/enrolled-courses",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscMortarBoard",
  },


  // 2. All Courses (For both)
  {
    id: 6,
    name: "All Courses",
    path: "/dashboard/all-courses",
    icon: "VscCompass",
  },

  // 3. Cart (Student only)
  {
    id: 7,
    name: "Cart",
    path: "/dashboard/cart",
    type: ACCOUNT_TYPE.STUDENT,
    icon: "VscArchive",
  },

  // 4. Instructor Specific (Dashboard / Add Course)
  {
    id: 2,
    name: "Dashboard",
    path: "/dashboard/instructor",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscDashboard",
  },
  {
    id: 4,
    name: "Add Course",
    path: "/dashboard/add-course",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscAdd",
  },
  {
    id: 10,
    name: "Live Schedule",
    path: "/dashboard/schedule",
    type: ACCOUNT_TYPE.INSTRUCTOR,
    icon: "VscCalendar",
  },


  // 5. My Profile (For both)
  {
    id: 1,
    name: "My Profile",
    path: "/dashboard/my-profile",
    icon: "VscAccount",
  },
]
