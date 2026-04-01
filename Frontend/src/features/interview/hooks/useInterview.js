
import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"

export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    
    //  GENERATE REPORT
   
    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })

            console.log("GENERATE RESPONSE:", response)

            if (response?.data?.interviewReport) {
                setReport(response.data.interviewReport)
                return response.data.interviewReport
            } else {
                console.log("❌ No interviewReport in response")
                return null
            }

        } catch (error) {
            console.log("❌ ERROR:", error.response?.data || error.message)
            return null
        } finally {
            setLoading(false)
        }
    }

    //  GET REPORT BY ID
  
    const getReportById = async (interviewId) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId)

            console.log("GET BY ID RESPONSE:", response)

            if (response?.data?.interviewReport) {
                setReport(response.data.interviewReport)
                return response.data.interviewReport
            } else {
                console.log("❌ Interview report not found")
                return null
            }

        } catch (error) {
            console.log("❌ ERROR:", error.response?.data || error.message)
            return null
        } finally {
            setLoading(false)
        }
    }

    
    //  GET ALL REPORTS
   
    const getReports = async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()

            console.log("GET ALL RESPONSE:", response)

            if (response?.data?.interviewReports) {
                setReports(response.data.interviewReports)
                return response.data.interviewReports
            } else {
                console.log("❌ No reports found")
                return []
            }

        } catch (error) {
            console.log("❌ ERROR:", error.response?.data || error.message)
            return []
        } finally {
            setLoading(false)
        }
    }

    //  DOWNLOAD PDF
  
    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })

            const url = window.URL.createObjectURL(
                new Blob([response.data], { type: "application/pdf" })
            )

            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()

        } catch (error) {
            console.log("❌ ERROR:", error.response?.data || error.message)
        } finally {
            setLoading(false)
        }
    }

  
    //  AUTO LOAD
    
    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [interviewId])

    return {
        loading,
        report,
        reports,
        generateReport,
        getReportById,
        getReports,
        getResumePdf
    }
}