import type { LucideIcon } from "lucide-react"
import {
  Landmark,
  FileBadge,
  UserCheck,
  ClipboardList,
  MapPin,
  School,
  Building2,
  FileText,
  GraduationCap,
  BadgeCheck,
} from "lucide-react"

export const HOW_TO_APPLY_SETTINGS_DOC = "howToApply"

export interface HowToApplyStep {
  id: string
  order: number
  title: string
  description: string
  icon: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface NoticeConfig {
  title: string
  message: string
  updatedAt?: string
}

export const DEFAULT_IMPORTANT_NOTICE: NoticeConfig = {
  title: "Important Notice",
  message: "Only students included in the Registration Approval List may proceed with account registration. For more information, kindly proceed to the CAYDO Office.",
}

export const DEFAULT_REGISTRATION_NOTICE: NoticeConfig = {
  title: "Registration Notice",
  message: "Only students included in the Registration Approval List may proceed with account registration.",
}

export function normalizeNotice(raw: unknown, fallback: NoticeConfig): NoticeConfig {
  if (!raw || typeof raw !== "object") return fallback
  const obj = raw as Record<string, unknown>
  return {
    title: typeof obj.title === "string" && obj.title.trim() ? obj.title : fallback.title,
    message: typeof obj.message === "string" && obj.message.trim() ? obj.message : fallback.message,
    updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : undefined,
  }
}

export const HOW_TO_APPLY_ICON_OPTIONS: { name: string; label: string; icon: LucideIcon }[] = [
  { name: "landmark", label: "Government Office", icon: Landmark },
  { name: "file-badge", label: "Certificate / Badge", icon: FileBadge },
  { name: "user-check", label: "Verification", icon: UserCheck },
  { name: "clipboard-list", label: "Application Form", icon: ClipboardList },
  { name: "map-pin", label: "Location", icon: MapPin },
  { name: "school", label: "School", icon: School },
  { name: "building", label: "Building / Office", icon: Building2 },
  { name: "file-text", label: "Documents", icon: FileText },
  { name: "graduation-cap", label: "Graduation", icon: GraduationCap },
  { name: "badge-check", label: "Approval", icon: BadgeCheck },
]

export function getHowToApplyIcon(iconName: string): LucideIcon {
  const found = HOW_TO_APPLY_ICON_OPTIONS.find((option) => option.name === iconName)
  return found ? found.icon : Landmark
}

export function normalizeHowToApplySteps(raw: unknown): HowToApplyStep[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((step: any, index: number) => ({
      id: typeof step?.id === "string" && step.id ? step.id : `step-${index}`,
      order: typeof step?.order === "number" ? step.order : index,
      title: typeof step?.title === "string" ? step.title : "",
      description: typeof step?.description === "string" ? step.description : "",
      icon: typeof step?.icon === "string" && step.icon ? step.icon : "landmark",
      active: step?.active !== false,
      createdAt: typeof step?.createdAt === "string" ? step.createdAt : "",
      updatedAt: typeof step?.updatedAt === "string" ? step.updatedAt : "",
    }))
    .filter((step) => step.title.trim() !== "" || step.description.trim() !== "")
    .sort((a, b) => a.order - b.order)
}

export function createDefaultHowToApplySteps(): HowToApplyStep[] {
  const now = new Date().toISOString()
  return [
    {
      id: "default-municipality",
      order: 0,
      title: "Proceed to the Municipality of Carmona",
      description: "Visit the Municipality of Carmona to begin your scholarship application process.",
      icon: "landmark",
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "default-comelec",
      order: 1,
      title: "Proceed to the COMELEC Office",
      description: "Secure your Voter's Certificate.",
      icon: "file-badge",
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "default-caydo",
      order: 2,
      title: "Proceed to the CAYDO Office",
      description: "Submit your requirements and complete the registration approval process.",
      icon: "user-check",
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ]
}
