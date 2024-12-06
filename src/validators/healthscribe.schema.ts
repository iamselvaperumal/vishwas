import { z } from 'zod'

export const personalDetailsSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  dob: z.string().min(1, { message: 'Date of Birth is required' }),
  phoneNumber: z.string().min(10, { message: 'Phone number is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  maritalStatus: z.string().min(1, { message: 'Marital status is required' }),
  numberOfChildren: z
    .number()
    .min(0, { message: 'Number of children cannot be negative' }),
})

export const demographicsSchema = z.object({
  address: z.string().min(1, { message: 'Address is required' }),
  ethnicity: z.string().optional(),
  language: z.string().min(1, { message: 'Language is required' }),
})

export const medicalHistorySchema = z.object({
  medicalCondition: z.string().optional(),
  treatment: z.string().optional(),
  surgery: z.string().optional(),
  previousProcedures: z.string().optional(),
  ongoingSymptoms: z.string().optional(),
  medicalEventsTimeline: z.string().optional(),
})

export const medicationHistorySchema = z.array(
  z.object({
    type: z.string().optional(),
    reason: z.string().optional(),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
    time: z.string().optional(),
  }),
)

export const allergiesSchema = z.array(
  z.object({
    type: z.string().optional(),
    description: z.string().optional(),
  }),
)

export const familyHistorySchema = z.object({
  immediateFamilyHealth: z.string().optional(),
  causesOfDeath: z.string().optional(),
  commonDiseases: z.string().optional(),
})

export const surgicalHistorySchema = z.object({
  operations: z.array(
    z.object({
      kind: z.string().optional(),
      type: z.string().optional(),
      position: z.string().optional(),
      dates: z.string().optional(),
      reportsResults: z.string().optional(),
      postSurgeryComplications: z.string().optional(),
      operatedDoctors: z.string().optional(),
    }),
  ),
})

export const patientSchema = z.object({
  personalDetails: personalDetailsSchema,
  demographics: demographicsSchema,
  medicalHistory: medicalHistorySchema,
  medicationHistory: medicationHistorySchema,
  allergies: allergiesSchema,
  familyHistory: familyHistorySchema,
  surgicalHistory: surgicalHistorySchema,
  insurancePolicyNumber: z.string().optional(),
  bloodGroup: z.string().min(1, { message: 'Blood group is required' }),
  height: z.string().min(1, { message: 'Height is required' }),
  weight: z.string().min(1, { message: 'Weight is required' }),
  bmi: z.string().optional(),
  vitals: z.array(z.any()).optional(),
  reports: z.array(z.any()).optional(),
  attenderContactDetails: z.string().optional(),
  attenderRelation: z.string().optional(),
})

export const simplePatientSchema = z.object({
  personalDetails: z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    phone: z.string().regex(/^\d{10}$/, {
      message: 'Phone number must be exactly 10 digits.',
    }),
    age: z.string().regex(/^\d+$/, { message: 'Age must be a number.' }),
  }),
  doctorId: z.string().uuid(),
})

export const getPatientSchema = z.object({
  id: z.string().uuid().min(1, { message: 'Id is required' }),
})
