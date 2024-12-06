import db from '@/db'
import { Session, User } from 'lucia'

export type ContextVariables = {
  db: typeof db
  user: User | null
  session: Session | null
}
