export type PatientTable = {
  id: string
  name: string
  age: string
  mobileNumber: string
}

export type ListJobTable = {
  [x: string]: ReactNode
  id: string
  status: string
  patientId: string
  createdAt: string
  formattedDate: string
  formattedTime: string
}
