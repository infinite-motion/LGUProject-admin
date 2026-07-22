export interface Subgroup {
  id: string;
  name: string;
  office?: string;
}

export interface ModuleTab {
  id: string;
  name: string;
  path: string;
  subgroups: Subgroup[];
}

export const LGU_MODULES: ModuleTab[] = [
  {
    id: "financial",
    name: "Financial",
    path: "/financial",
    subgroups: [
      { id: "budgeting", name: "Budgeting", office: "MBO" },
      { id: "treasury", name: "Treasury / Collections", office: "MTO" },
      { id: "accounting", name: "Accounting / Disbursement", office: "Accounting Office" },
      { id: "property-supply", name: "Property and Supply", office: "GSO" },
    ],
  },
  {
    id: "hr",
    name: "Personnel/HR",
    path: "/hr",
    subgroups: [
      { id: "recruitment", name: "Recruitment and Appointments" },
      { id: "payroll", name: "Payroll" },
      { id: "leave-attendance", name: "Leave and Attendance" },
      { id: "personnel-records", name: "Personnel Records", office: "HRMO" },
    ],
  },
  {
    id: "health",
    name: "Health Records",
    path: "/health",
    subgroups: [
      { id: "patient-records", name: "Patient Records" },
      { id: "immunization", name: "Immunization Programs" },
      { id: "program-monitoring", name: "Health Program Monitoring", office: "MHO" },
    ],
  },
  {
    id: "disaster",
    name: "Disaster Response",
    path: "/disaster",
    subgroups: [
      { id: "incident-reporting", name: "Incident Reporting" },
      { id: "resource-inventory", name: "Resource and Equipment Inventory" },
      { id: "evacuation-relief", name: "Evacuation and Relief Operations", office: "MDRRMO" },
    ],
  },
  {
    id: "registry",
    name: "Civil Registry",
    path: "/registry",
    subgroups: [
      { id: "birth-records", name: "Birth Records" },
      { id: "marriage-records", name: "Marriage Records" },
      { id: "death-records", name: "Death Records", office: "MCRO" },
    ],
  },
  {
    id: "assessment",
    name: "Assessment",
    path: "/assessment",
    subgroups: [
      { id: "real-property", name: "Real Property Assessment" },
      { id: "tax-mapping", name: "Tax Mapping", office: "Assessor's Office" },
    ],
  },
  {
    id: "welfare",
    name: "Social Welfare",
    path: "/welfare",
    subgroups: [
      { id: "case-management", name: "Case Management" },
      { id: "aid-assistance", name: "Aid and Assistance Programs" },
      { id: "senior-pwd", name: "Senior Citizen / PWD Registry", office: "MSWDO" },
    ],
  },
  {
    id: "agriculture",
    name: "Agriculture",
    path: "/agriculture",
    subgroups: [
      { id: "farmer-registry", name: "Farmer Registry (RSBSA)" },
      { id: "crop-livestock", name: "Crop and Livestock Monitoring" },
      { id: "extension-programs", name: "Extension Programs", office: "Agriculture's Office" },
    ],
  },
  {
    id: "planning",
    name: "Planning and Development",
    path: "/planning",
    subgroups: [
      { id: "development-planning", name: "Development Planning" },
      { id: "project-monitoring", name: "Project Monitoring", office: "MPDO" },
    ],
  },
  {
    id: "general-services",
    name: "General Services",
    path: "/general-services",
    subgroups: [
      { id: "procurement", name: "Procurement" },
      { id: "facilities-asset", name: "Facilities and Asset Management", office: "GSO" },
    ],
  },
  {
    id: "peace-safety",
    name: "Peace, Safety and Traffic",
    path: "/peace-safety",
    subgroups: [
      { id: "traffic-management", name: "Traffic Management" },
      { id: "peace-order", name: "Peace and Order Reports", office: "MPSTMO" },
    ],
  },
  {
    id: "economic-dev",
    name: "Local Economic Development",
    path: "/economic-dev",
    subgroups: [
      { id: "business-permits", name: "Business Permits and Licensing" },
      { id: "investment-promotion", name: "Investment Promotion", office: "LEDO" },
    ],
  },
  {
    id: "engineering",
    name: "Engineering",
    path: "/engineering",
    subgroups: [
      { id: "infrastructure", name: "Infrastructure Projects" },
      { id: "building-permits", name: "Building Permits", office: "MEO" },
    ],
  },
];

export const LGU_OFFICES = [
  "Mayor's Office",
  "MISO",
  "MDRRMO",
  "MPSTMO",
  "LEDO",
  "GSO",
  "MBO",
  "MPDO",
  "MTO",
  "MEO",
  "Accounting Office",
  "HRMO",
  "MHO",
  "MENRO",
  "Assessor's Office",
  "MCRO",
  "MSWDO",
  "Agriculture's Office",
  "Other"
];

export const ADMIN_MODULES = [
  { id: "profile", name: "Organization Profile", path: "/profile" },
  { id: "staff", name: "Staff Directory", path: "/staff" },
  { id: "roles", name: "Role Manager", path: "/roles" },
];
