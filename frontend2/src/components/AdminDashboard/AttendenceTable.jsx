import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

const rawData = [
  { section: 'Section A', subsection: 'Subsection A1', averageAttendance: 92 },
  { section: 'Section A', subsection: 'Subsection A2', averageAttendance: 85 },
  { section: 'Section B', subsection: 'Subsection B1', averageAttendance: 78 },
  { section: 'Section B', subsection: 'Subsection B2', averageAttendance: 88 },
  { section: 'Section B', subsection: 'Subsection B3', averageAttendance: 91 },
];

export default function AttendanceTable() {
  const grouped = {};
  rawData.forEach(row => {
    if (!grouped[row.section]) grouped[row.section] = [];
    grouped[row.section].push(row);
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Attendence report</h2>
      <TableContainer component={Paper} className="shadow-md rounded-xl overflow-hidden">
        <Table>
          <TableHead className="bg-blue-100">
            <TableRow>
              <TableCell className="font-bold text-base w-[25%]">Section</TableCell>
              <TableCell className="font-bold text-base w-[50%]">Subsection</TableCell>
              <TableCell className="font-bold text-base w-[25%]">Average Attendance (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(grouped).map(([section, rows]) =>
              rows.map((row, idx) => (
                <TableRow key={section + '-' + idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {idx === 0 && (
                    <TableCell
                      rowSpan={rows.length}
                      className="align-top font-medium w-[25%]"
                    >
                      {section}
                    </TableCell>
                  )}
                  <TableCell className="w-[50%]">{row.subsection}</TableCell>
                  <TableCell className="w-[25%]">{row.averageAttendance}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
