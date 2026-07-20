import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useParams, Link } from "react-router-dom"
import { FaBook, FaChevronRight } from "react-icons/fa"

import Footer from "../components/Common/Footer"
import CourseCard from "../components/core/Catalog/Course_Card"
import CourseSlider from "../components/core/Catalog/Course_Slider"
import DynamicCanvasBg from "../components/Common/DynamicCanvasBg"
import { apiConnector } from "../services/apiConnector"
import { categories } from "../services/apis"
import { getCatalogPageData } from "../services/operations/pageAndComponntDatas"
import Error from "./Error"

function Catalog() {
  const { loading } = useSelector((state) => state.profile)
  const { catalogName } = useParams()
  const [active, setActive] = useState(1)
  const [catalogPageData, setCatalogPageData] = useState(null)
  const [categoryId, setCategoryId] = useState("")

  // Fetch All Categories
  useEffect(() => {
    ;(async () => {
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API)
        const category_id = res?.data?.data?.filter(
          (ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName
        )[0]._id
        setCategoryId(category_id)
      } catch (error) {
        console.log("Could not fetch Categories.", error)
      }
    })()
  }, [catalogName])

  useEffect(() => {
    if (categoryId) {
      ;(async () => {
        try {
          const res = await getCatalogPageData(categoryId)
          setCatalogPageData(res)
        } catch (error) {
          console.log(error)
        }
      })()
    }
  }, [categoryId])

  if (loading || !catalogPageData) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-paper">
        <div className="spinner"></div>
      </div>
    )
  }
  if (!loading && !catalogPageData.success) {
    return <Error />
  }

  return (
    <div className="bg-paper min-h-screen font-sans text-navy relative overflow-hidden flex flex-col justify-between">
      {/* Interactive Dynamic Background */}
      <DynamicCanvasBg />

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-12 text-center border-b border-line/40">
        <div className="mx-auto flex w-11/12 max-w-maxContent flex-col items-center justify-between gap-4 text-center">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-line">
            <Link to="/" className="hover:text-royal-blue transition-colors">Home</Link>
            <FaChevronRight className="text-[9px]" />
            <span>Catalog</span>
            <FaChevronRight className="text-[9px]" />
            <span className="text-royal-blue">{catalogPageData?.data?.selectedCategory?.name}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-navy mt-2">
            Category:{" "}
            <span className="bg-gradient-to-r from-royal-blue via-violet to-pink-500 bg-clip-text text-transparent">
              {catalogPageData?.data?.selectedCategory?.name}
            </span>
          </h1>

          <p className="max-w-3xl text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            {catalogPageData?.data?.selectedCategory?.description}
          </p>
        </div>
      </section>

      {/* Main Catalog Content */}
      <main className="relative z-10 flex-grow mx-auto w-11/12 max-w-maxContent py-12 text-left space-y-14">
        {/* Section 1: Selected Category */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-8 rounded-[28px] shadow-xl">
          <div className="flex items-center justify-between border-b border-line/60 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-navy">Courses to Get You Started</h2>
            <div className="flex gap-4 text-sm font-semibold">
              <button
                className={`pb-1 ${active === 1 ? "text-royal-blue border-b-2 border-royal-blue font-bold" : "text-slate-500 hover:text-navy"}`}
                onClick={() => setActive(1)}
              >
                Most Popular
              </button>
              <button
                className={`pb-1 ${active === 2 ? "text-royal-blue border-b-2 border-royal-blue font-bold" : "text-slate-500 hover:text-navy"}`}
                onClick={() => setActive(2)}
              >
                New Releases
              </button>
            </div>
          </div>

          <CourseSlider Courses={catalogPageData?.data?.selectedCategory?.courses} />
        </div>

        {/* Section 2: Different Category */}
        {catalogPageData?.data?.differentCategory && (
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-8 rounded-[28px] shadow-xl">
            <h2 className="text-2xl font-bold text-navy mb-6">
              Top Courses in {catalogPageData?.data?.differentCategory?.name}
            </h2>
            <CourseSlider Courses={catalogPageData?.data?.differentCategory?.courses} />
          </div>
        )}

        {/* Section 3: Frequently Bought */}
        {catalogPageData?.data?.mostSellingCourses?.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-8 rounded-[28px] shadow-xl">
            <h2 className="text-2xl font-bold text-navy mb-6">Frequently Enrolled Courses</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {catalogPageData?.data?.mostSellingCourses
                ?.slice(0, 4)
                .map((course, i) => (
                  <CourseCard course={course} key={i} Height={"h-[240px]"} />
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Catalog
