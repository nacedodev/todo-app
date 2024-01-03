export interface TodoModel {
    id: number,
    title: string,
    completed: boolean,
    editing: boolean,
    today?: boolean,
    date?: string
}

export type FilterType = 'active' | 'completed' | 'today'