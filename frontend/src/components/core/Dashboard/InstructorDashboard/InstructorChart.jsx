import { useState } from "react"
import { Chart, registerables } from "chart.js"
import { Pie } from "react-chartjs-2"

Chart.register(...registerables)

export default function InstructorChart({ courses }) {
  // State to keep track of the currently selected chart
  const [currChart, setCurrChart] = useState("students")

  // Curated premium palettes
  const studentsPalette = ["#2563EB", "#7C3AED", "#06B6D4", "#14B8A6", "#3B82F6", "#8B5CF6", "#A78BFA", "#60A5FA"]
  const incomePalette = ["#10B981", "#14B8A6", "#2563EB", "#7C3AED", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"]

  // Data for the chart displaying student information
  const chartDataStudents = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalStudentsEnrolled),
        backgroundColor: studentsPalette.slice(0, courses.length),
        borderWidth: 2,
        borderColor: "#FFFFFF",
      },
    ],
  }

  // Data for the chart displaying income information
  const chartIncomeData = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalAmountGenerated),
        backgroundColor: incomePalette.slice(0, courses.length),
        borderWidth: 2,
        borderColor: "#FFFFFF",
      },
    ],
  }

  // Options for the chart
  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          font: {
            family: "Poppins",
            size: 11,
            weight: "500",
          },
          color: "#475569",
        },
      },
    },
  }

  return (
    <div className="flex flex-col gap-y-4 w-full h-full text-left">
      <div className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-bold text-navy font-fraunces">Visualize Performance</h3>
        
        {/* Toggle buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setCurrChart("students")}
            className={`rounded-full py-1.5 px-4 text-xs font-semibold transition-all duration-200 ${
              currChart === "students"
                ? "bg-royal-blue text-white shadow-sm"
                : "bg-royal-blue/15 text-royal-blue hover:bg-royal-blue/20"
            }`}
          >
            Clients
          </button>
          <button
            onClick={() => setCurrChart("income")}
            className={`rounded-full py-1.5 px-4 text-xs font-semibold transition-all duration-200 ${
              currChart === "income"
                ? "bg-royal-blue text-white shadow-sm"
                : "bg-royal-blue/15 text-royal-blue hover:bg-royal-blue/20"
            }`}
          >
            Income
          </button>
        </div>
      </div>

      <div className="relative mx-auto aspect-square h-[260px] w-full mt-2">
        <Pie
          data={currChart === "students" ? chartDataStudents : chartIncomeData}
          options={options}
        />
      </div>
    </div>
  )
}
