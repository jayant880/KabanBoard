export type Priority = 'High' | 'Medium' | 'Low'

export interface Task {
  id: string
  title: string
  description: string | null
  priority: Priority
  dueDate: Date | null
  createdAt: Date
}

export interface Column {
  id: string
  name: string
  taskList: Task[]
}

export interface Board {
  id: string
  name: string
  columnList: Column[]
}
