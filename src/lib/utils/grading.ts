import { GRADES, Grade, ResultSummary } from '@/types'

export function calculateGrade(score: number): Grade {
  const grade = GRADES.find(g => score >= g.min && score <= g.max)
  return grade || GRADES[GRADES.length - 1] // Return 'F' if no match
}

export function calculateAverage(scores: number[]): number {
  if (scores.length === 0) return 0
  const sum = scores.reduce((acc, score) => acc + score, 0)
  return Number((sum / scores.length).toFixed(2))
}

export function calculateTotal(scores: number[]): number {
  return scores.reduce((acc, score) => acc + score, 0)
}

export function calculatePosition(
  studentTotal: number,
  allTotals: number[]
): number {
  const sortedTotals = [...allTotals].sort((a, b) => b - a)
  return sortedTotals.indexOf(studentTotal) + 1
}

export function generateRemark(grade: string): string {
  const remarks: Record<string, string> = {
    A: 'Excellent performance',
    B: 'Very good performance',
    C: 'Good performance',
    D: 'Fair performance',
    E: 'Satisfactory performance',
    F: 'Needs improvement',
  }
  return remarks[grade] || 'No remark'
}

export function formatResultSummary(data: any): ResultSummary {
  const scores = data.results.map((r: any) => r.score)
  const total = calculateTotal(scores)
  const average = calculateAverage(scores)

  return {
    student_name: `${data.student.first_name} ${data.student.last_name}`,
    admission_number: data.student.admission_number,
    class_name: data.class.name,
    session: data.session,
    term: data.term,
    subjects: data.results.map((r: any) => ({
      name: r.subject.name,
      score: r.score,
      grade: r.grade,
      remark: r.remark,
    })),
    total,
    average,
    position: 0, // Will be calculated after all students are processed
  }
}
