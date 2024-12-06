'use client'

import { ReactNode, createContext, useContext, useState } from 'react'

type Patient = {
  id: string
  name: string
  dob: string
  phoneNumber: string
  tags?: string[]
}

interface PatientContextType {
  selectedPatient: Patient | null
  setSelectedPatient: (patient: Patient) => void
}

const PatientContext = createContext<PatientContextType | undefined>(undefined)

export const usePatient = () => {
  const context = useContext(PatientContext)
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider')
  }
  return context
}

export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  return (
    <PatientContext.Provider value={{ selectedPatient, setSelectedPatient }}>
      {children}
    </PatientContext.Provider>
  )
}
