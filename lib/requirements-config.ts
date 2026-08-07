export const REQUIRED_DOCS = [
  "Filled-out Application Form",
  "School Registration Form",
  "Enrollment Receipt",
  "School ID / Cert of Non-issuance",
  "Original Barangay Indigency",
  "Original Barangay Clearance",
  "Letter to City Mayor",
  "Voter's Certification",
  "Previous Grades",
]

export function matchesDocName(docCategoryName: string | undefined, requiredName: string): boolean {
  if (docCategoryName === requiredName) return true
  if (requiredName === "School ID / Cert of Non-issuance" && docCategoryName === "School ID / Certificate of Non-issuance") return true
  if (requiredName === "School ID / Certificate of Non-issuance" && docCategoryName === "School ID / Cert of Non-issuance") return true
  return false
}

export function resolveRequirementLabel(doc: { categoryName?: string; name?: string }): string {
  if (doc.categoryName) return doc.categoryName
  if (doc.name) {
    const match = REQUIRED_DOCS.find((requiredName) => matchesDocName(doc.name, requiredName))
    if (match) return match
  }
  return doc.name || "Untitled Document"
}
