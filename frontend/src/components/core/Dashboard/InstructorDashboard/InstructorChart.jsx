import { useState } from "react"
import { Chart, registerables } from "chart.js"
import { Pie, Doughnut, Bar } from "react-chartjs-2"
import { FaChartPie, FaChartBar, FaCircleNotch } from "react-icons/fa"

Chart.register(...registerables)

export default function InstructorChart({ courses }) {
  // State to keep track of the currently selected metric and chart type
  const [currChart, setCurrChart] = useState("students")
  const [chartType, setChartType] = useState("doughnut")

  // Curated premium palettes
  const studentsPalette = [
    "#3B82F6", // Royal Blue
    "#7C3AED", // Violet
    "#06B6D4", // Cyan
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EC4899", // Pink
    "#8B5CF6", // Lavender
    "#14B8A6", // Teal
  ]

  const incomePalette = [
    "#10B981", // Emerald
    "#14B8A6", // Teal
    "#3B82F6", // Royal Blue
    "#7C3AED", // Violet
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#8B5CF6", // Lavender
    "#EC4899", // Pink
  ]

  const isStudents = currChart === "students"

  // Data for the chart displaying student information
  const chartDataStudents = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        label: "Students",
        data: courses.map((course) => course.totalStudentsEnrolled),
        backgroundColor: studentsPalette.slice(0, courses.length),
        hoverBackgroundColor: studentsPalette.slice(0, courses.length).map(c => `${c}EE`),
        borderWidth: chartType === "bar" ? 0 : 2,
        borderColor: "#FFFFFF",
        borderRadius: chartType === "bar" ? 8 : 0,
      },
    ],
  }

  // Data for the chart displaying income information
  const chartIncomeData = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        label: "Earnings (₹)",
        data: courses.map((course) => course.totalAmountGenerated),
        backgroundColor: incomePalette.slice(0, courses.length),
        hoverBackgroundColor: incomePalette.slice(0, courses.length).map(c => `${c}EE`),
        borderWidth: chartType === "bar" ? 0 : 2,
        borderColor: "#FFFFFF",
        borderRadius: chartType === "bar" ? 8 : 0,
      },
    ],
  }

  // Common options for Pie & Doughnut charts
  const pieOptions = {
    maintainAspectRatio: false,
    cutout: chartType === "doughnut" ? "68%" : "0%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 10,
          padding: 15,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            family: "Poppins",
            size: 11,
            weight: "500",
          },
          color: "#4B5563",
        },
      },
      tooltip: {
        backgroundColor: "#0D1B3D",
        padding: 12,
        titleFont: { family: "Poppins", size: 12, weight: "bold" },
        bodyFont: { family: "Poppins", size: 12 },
        cornerRadius: 8,
        displayColors: true,
      },
    },
  }

  // Options for Bar chart
  const barOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0D1B3D",
        padding: 12,
        titleFont: { family: "Poppins", size: 12, weight: "bold" },
        bodyFont: { family: "Poppins", size: 12 },
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        grid: {
          color: "#F3F4F6",
          drawTicks: false,
        },
        border: {
          dash: [4, 4],
          display: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            family: "Poppins",
            size: 11,
          },
          callback: function(value) {
            if (currChart === "income") {
              return "₹" + value.toLocaleString()
            }
            return value
          }
        },
      },
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            family: "Poppins",
            size: 11,
            weight: "500",
          },
          maxRotation: 15,
          minRotation: 0,
        },
      },
    },
  }

  const renderChart = () => {
    const data = isStudents ? chartDataStudents : chartIncomeData
    const options = chartType === "bar" ? barOptions : pieOptions

    switch (chartType) {
      case "pie":
        return <Pie data={data} options={options} />
      case "bar":
        return <Bar data={data} options={options} />
      case "doughnut":
      default:
        return <Doughnut data={data} options={options} />
    }
  }

  return (
    <div className="flex flex-col gap-y-6 w-full h-full text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line/50 pb-4">
        <div>
          <h3 className="text-lg font-bold text-navy font-fraunces">Visual Performance</h3>
          <p className="text-xs text-ink-soft mt-0.5">Visualize student enrollments and revenue distribution across courses</p>
        </div>
        
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Chart Type Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setChartType("doughnut")}
              title="Doughnut Chart"
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                chartType === "doughnut"
                  ? "bg-white text-royal-blue shadow-sm"
                  : "text-slate-500 hover:text-navy"
              }`}
            >
              <FaCircleNotch className="text-sm" />
            </button>
            <button
              onClick={() => setChartType("pie")}
              title="Pie Chart"
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                chartType === "pie"
                  ? "bg-white text-royal-blue shadow-sm"
                  : "text-slate-500 hover:text-navy"
              }`}
            >
              <FaChartPie className="text-sm" />
            </button>
            <button
              onClick={() => setChartType("bar")}
              title="Bar Chart"
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                chartType === "bar"
                  ? "bg-white text-royal-blue shadow-sm"
                  : "text-slate-500 hover:text-navy"
              }`}
            >
              <FaChartBar className="text-sm" />
            </button>
          </div>

          {/* Metric Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setCurrChart("students")}
              className={`rounded-lg py-1 px-3 text-xs font-semibold transition-all duration-200 ${
                isStudents
                  ? "bg-white text-royal-blue shadow-sm"
                  : "text-slate-500 hover:text-navy"
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setCurrChart("income")}
              className={`rounded-lg py-1 px-3 text-xs font-semibold transition-all duration-200 ${
                !isStudents
                  ? "bg-white text-royal-blue shadow-sm"
                  : "text-slate-500 hover:text-navy"
              }`}
            >
              Revenue
            </button>
          </div>
        </div>
      </div>

      <div className="relative mx-auto w-full h-[280px] flex items-center justify-center">
        {renderChart()}
      </div>
    </div>
  )
}
