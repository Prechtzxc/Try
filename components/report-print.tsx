import type { Key, ReactNode } from "react"

export type ReportCategory = "Claimed" | "Unclaimed" | "Unsuccessful"

export type ReportScholar = {
  id: string
  studentId: string
  name: string
  email: string
  contactNumber: string
  age: string
  gender: string
  course: string
  schoolName: string
  barangay: string
  yearLevel: string
  applicationStatus: string
  archivedAt?: string
  archiveCycle?: string
  year: string
  isClaimed: boolean
  isCancelled?: boolean
  claimedAt: string
  amountReceived: string
  rejectionReason: string
  isPWD: boolean
}

type ReportPrintProps = {
  cycle: string
  generatedAt: string
  generatedBy: string
  scheduledAmount: string
  claimed: ReportScholar[]
  unclaimed: ReportScholar[]
  unsuccessful: ReportScholar[]
}

const displayValue = (value?: string | number | null) => {
  const trimmedValue = String(value ?? "").trim()
  return trimmedValue ? trimmedValue : "N/A"
}

const schoolAndCourse = (record: ReportScholar) => {
  const school = record.schoolName?.trim()
  const course = record.course?.trim()
  return [school, course].filter(Boolean).join(" / ") || "N/A"
}

const generatedDateLabel = (generatedAt: string) => {
  const date = new Date(generatedAt)
  if (Number.isNaN(date.getTime())) return generatedAt

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

const cleaningCycle = (cycle: string) => String(cycle ?? "").replace(/^Cycle Ended:\s*/i, "").trim()

const cycleEndedLabel = (cycle: string) => displayValue(cleaningCycle(cycle))

const cell = (content: ReactNode, className?: string, key?: Key) => (
  <td key={key} className={className}>{content}</td>
)

type PrintTableProps = {
  title: string
  headers: string[]
  colWidths: string[]
  records: ReportScholar[]
  renderRow: (record: ReportScholar, index: number) => ReactNode[]
}

function PrintTable({ title, headers, colWidths, records, renderRow }: PrintTableProps) {
  return (
    <table className="print-report-table">
      <colgroup>
        {colWidths.map((width, i) => <col key={i} style={{ width }} />)}
      </colgroup>
      <thead>
        <tr className="print-report-table-title">
          <th scope="colgroup" colSpan={headers.length}>{title}</th>
        </tr>
        <tr>
          {headers.map((header, i) => <th scope="col" key={i}>{header}</th>)}
        </tr>
      </thead>
      <tbody>
        {records.length === 0 ? (
          <tr>
            <td colSpan={headers.length}>No records found.</td>
          </tr>
        ) : records.map((record, index) => (
          <tr key={record.id}>{renderRow(record, index)}</tr>
        ))}
      </tbody>
    </table>
  )
}

export function ReportPrint({
  cycle,
  generatedAt,
  generatedBy,
  scheduledAmount,
  claimed,
  unclaimed,
  unsuccessful,
}: ReportPrintProps) {
  const renderClaimedRow = (record: ReportScholar, index: number) => {
    const amount = (record: ReportScholar) => (
      record.amountReceived && record.amountReceived !== "N/A"
        ? record.amountReceived
        : displayValue(scheduledAmount)
    )

    return [
      cell(index + 1, undefined, "n"),
      cell(displayValue(record.studentId), undefined, "sid"),
      cell(displayValue(record.name), undefined, "name"),
      cell(displayValue(record.gender), undefined, "gender"),
      cell(displayValue(record.age), undefined, "age"),
      cell(schoolAndCourse(record), undefined, "school"),
      cell(displayValue(record.barangay), undefined, "barangay"),
      cell("CLAIMED", "cell-nowrap", "status"),
      cell(displayValue(record.claimedAt), undefined, "date"),
      cell(amount(record), "cell-amount", "amt"),
    ]
  }

  const renderUnclaimedRow = (record: ReportScholar, index: number) => [
    cell(index + 1, undefined, "n"),
    cell(displayValue(record.studentId), undefined, "sid"),
    cell(displayValue(record.name), undefined, "name"),
    cell(displayValue(record.gender), undefined, "gender"),
    cell(displayValue(record.age), undefined, "age"),
    cell(schoolAndCourse(record), undefined, "school"),
    cell(displayValue(record.barangay), undefined, "barangay"),
    cell("UNCLAIMED", "cell-nowrap", "status"),
    cell(displayValue(scheduledAmount), "cell-amount", "amount"),
  ]

  const renderUnsuccessfulRow = (record: ReportScholar, index: number) => [
    cell(index + 1, undefined, "n"),
    cell(displayValue(record.studentId), undefined, "sid"),
    cell(displayValue(record.name), undefined, "name"),
    cell(schoolAndCourse(record), undefined, "school"),
    cell(displayValue(record.barangay), undefined, "barangay"),
    cell(record.applicationStatus === "cancelled" ? "CANCELLED" : "REJECTED", "cell-nowrap", "status"),
    cell(displayValue(record.rejectionReason), undefined, "reason"),
  ]

  return (
    <section className="print-report" aria-label="Scholarship report">
      <header className="print-report-header">
        <h1>BTS SCHOLARSHIP MANAGEMENT SYSTEM</h1>
        <p className="print-report-tagline">BTS Carmona | Bawat Tahanan May Scholar</p>
        <h2 className="print-report-name">REPORT SUMMARY</h2>
        <dl className="print-report-meta">
          <div><dt>Cycle</dt><dd>{cycleEndedLabel(cycle)}</dd></div>
          <div><dt>Cycle Ended</dt><dd>{cycleEndedLabel(cycle)}</dd></div>
          <div><dt>Generated</dt><dd>{generatedDateLabel(generatedAt)}</dd></div>
          <div><dt>Generated by</dt><dd>{displayValue(generatedBy)}</dd></div>
        </dl>
      </header>

      <PrintTable
        title="CLAIMED SCHOLARS LIST"
        headers={["#", "Student ID", "Full Name", "Gender", "Age", "School / Course", "Barangay", "Status", "Date Claimed", "Amount"]}
        colWidths={["2.5%", "11%", "16%", "5.5%", "5%", "20%", "12%", "6.5%", "13.5%", "8%"]}
        records={claimed}
        renderRow={renderClaimedRow}
      />

      <PrintTable
        title="UNCLAIMED SCHOLARS LIST"
        headers={["#", "Student ID", "Full Name", "Gender", "Age", "School / Course", "Barangay", "Status", "Scheduled Amount"]}
        colWidths={["2.5%", "11.5%", "16%", "6%", "5.5%", "21%", "12%", "7.5%", "18%"]}
        records={unclaimed}
        renderRow={renderUnclaimedRow}
      />

      <PrintTable
        title="UNSUCCESSFUL APPLICATIONS LIST"
        headers={["#", "Student ID", "Full Name", "School / Course", "Barangay", "Status", "Reason / Remarks"]}
        colWidths={["3%", "13%", "18%", "23%", "13%", "9%", "21%"]}
        records={unsuccessful}
        renderRow={renderUnsuccessfulRow}
      />
    </section>
  )
}