'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function CieMarksTable({ data }: any) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No CIE marks data available.
      </div>
    )
  }

  const getCieColumns = () => {
    if (data.length === 0) return []
    
    const firstRow = data[0]
    const cieColumns: string[] = []
    
    Object.keys(firstRow).forEach(key => {
      if (key.match(/^cie\d+$/i)) {
        cieColumns.push(key)
      }
    })
    
    return cieColumns.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''))
      const numB = parseInt(b.replace(/\D/g, ''))
      return numA - numB
    })
  }

  const cieColumns = getCieColumns()

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold w-16">Sr No.</TableHead>
            <TableHead className="font-semibold">Roll No</TableHead>
            <TableHead className="font-semibold min-w-[150px]">Name</TableHead>
            {cieColumns.map((col) => {
              const cieNumber = col.replace('cie', '')
              return (
                <TableHead key={col} className="text-center font-semibold min-w-[80px]">
                  CIE {cieNumber}
                </TableHead>
              )
            })}
            <TableHead className="text-center font-semibold min-w-[100px]">
              Total Marks
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row: any, index: number) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium">{row.roll_no || '-'}</TableCell>
              <TableCell>{row.name || '-'}</TableCell>
              {cieColumns.map((col) => (
                <TableCell key={col} className="text-center">
                  {row[col] ?? '-'}
                </TableCell>
              ))}
              <TableCell className="text-center font-semibold">
                {row.total_marks ?? '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}