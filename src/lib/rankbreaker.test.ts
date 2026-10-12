import fs from 'fs'
import path from 'path'
import { parseRankbreakerCsv } from './rankbreaker'

describe('Rankbreaker question import', () => {
  it('accepts the supplied 200-question example CSV', () => {
    const csv = fs.readFileSync(
      path.join(
        process.cwd(),
        'public',
        'cee-rankbreaker-questions-example.csv',
      ),
      'utf8',
    )

    const { rows, errors } = parseRankbreakerCsv(csv)

    expect(errors).toEqual([])
    expect(rows).toHaveLength(200)
    expect(rows.filter((row) => row.subject === 'Physics')).toHaveLength(50)
    expect(rows.filter((row) => row.subject === 'Chemistry')).toHaveLength(50)
    expect(rows.filter((row) => row.subject === 'Zoology')).toHaveLength(40)
    expect(rows.filter((row) => row.subject === 'Botany')).toHaveLength(40)
    expect(
      rows.filter((row) => row.subject === 'Mental Agility Test'),
    ).toHaveLength(20)
  })
})
