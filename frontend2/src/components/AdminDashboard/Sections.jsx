import { useState } from 'react';
import {
  Typography,
  Button,
  Container,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link, useNavigate } from 'react-router-dom';
import { useSectionsContext, useSectionsDispatchContext } from '../../customHooks/SectionsContext';
import DynamicForm from '../shared/DynamicForm';
import SuccessMessage from '../shared/success';
import ErrorMessage from '../shared/error';
import ViewTeachers from '../shared/ViewTeachers';
import { APIBase } from '../../data/data';
import ViewStudents from '../shared/ViewStudents';



const addSectionFormFields = [
  { label: "Name", name: "name", type: "text", required: true },
  { label: "Year", name: "year", type: "number", required: true },
  { label: "Department", name: "department", type: "text", required: true },
];

const addSubSectionFormFields = [
  { label: "Name", name: "name", type: "text", required: true },
];

export default function Section() {
  const [expanded, setExpanded] = useState(false);
  const [showForm1, setShowForm1] = useState(false);
  const [showForm2, setShowForm2] = useState(false);
  const [showForm3, setShowForm3] = useState(false);
  const [showForm4, setShowForm4] = useState(false);
  const [activeSubId, setActiveSubId] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);


  const navigate = useNavigate();
  const { sections, addSection, addSubSection } = useSectionsContext();
  const dispatch = useSectionsDispatchContext();

  const handleChange = (panel) => (_, isExpanded) =>
    setExpanded(isExpanded ? panel : false);

  const handleAddSection = (data) => {
    try {
      addSection(data, dispatch);
      setSuccess({ title: "Success", message: "Section added successfully!" });
    }
    catch (error) {
      setError({ title: "Error", message: error.message });
    }
  };
  const handleAddSubsection = (setionId, data) => {
    try {
      addSubSection(setionId, data.name, dispatch);
      setSuccess({ title: "Success", message: "Section added successfully!" });
    }
    catch (error) {
      setError({ title: "Error", message: error.message });
    }
  };

  const handleAddTeachers = (selected) => {
    const token = localStorage.getItem('token');
    const teacherIds = selected.map((teacher)=>teacher.teacherId)
    async function addTeachers() {
      try {
        const response = await fetch(`${APIBase}/subsection/addTeachers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ subsectionId:activeSubId, teacherIds: teacherIds })
        });
        const result = await response.json();
        if (response.ok) {
          setSuccess({ title: "Success", message: "Teachers added successfully!" });
        } else {
          setError({ title: "Failed to add teachers", message: result.message });
        }
      } catch (err) {
        setError({ title: "Failed to add teachers", message: err.message });
      }
    }
    addTeachers();
  }

const handleAddStudents = ( selected) => {
    const token = localStorage.getItem('token');
    const studentRolls = selected.map((student)=>student.rollNumber) // changed here
    async function addStudents() {
      try {
        const response = await fetch(`${APIBase}/subsection/addStudents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ subsectionId:activeSubId, studentRolls: studentRolls })
        });
        const result = await response.json();
        if (response.ok) {
          setSuccess({ title: "Success", message: "Students added successfully!" });
        } else {
          setError({ title: "Failed to add students", message: result.message });
        }
      } catch (err) {
        setError({ title: "Failed to add students", message: err.message });
      }
    }
    addStudents();
  }


  const prefixYear = (year) => {
    switch (year) {
      case 1:
        return "1st";
      case 2:
        return "2nd";
      case 3:
        return "3rd";
      default:
        return `${year}th`;
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {sections.length == 0 ? "No sections available" : "Sections"}
        </Typography>

        {/* ───────── 2. SECTION LIST ───────── */}
        {sections.map((section, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Accordion
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index}bh-content`}
                id={`panel${index}bh-header`}
              >
                <Stack direction="row" spacing={4} alignItems="center" flexWrap="wrap" width="100%">
                  <Typography sx={{ width: '33%', flexShrink: 0 }}>
                    {section.name}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {section.subsections.length}{section.subsections.length == 1 ? " subsection" : " subsections"}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {prefixYear(section.year)} year
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>
                    {section.department}
                  </Typography>
                </Stack>
              </AccordionSummary>


              {/* ─── SUBSECTION LIST ─── */}
              <AccordionDetails>
                {section.subsections.length != 0 &&
                <div className="rounded border border-gray-200 overflow-hidden">
                  {section.subsections.map((sub, subIndex) => (
                    <div
                      key={subIndex}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 ${subIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } border-b border-b-gray-100 last:border-none`}
                    >
                      <Link
                        to={`/upload-video/${section.sectionId}/${sub.id}`}
                        className="text-blue-600 font-semibold text-lg hover:underline mb-2 sm:mb-0"
                      >
                        {sub.name}
                      </Link>

                      <div className="flex flex-wrap gap-2 justify-end sm:justify-start">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => navigate(`/subsection/${sub.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => { setActiveSubId(sub.id); setShowForm3(true)}}
                          className="!bg-pink-500 hover:!bg-pink-600"
                        >
                          Add Students
                        </Button>

                        {showForm3 &&
                        <ViewStudents 
                        isForAdd
                        onSubmit={(selected) => {
                          handleAddStudents( selected);
                          setShowForm3(false);
                        }}
                        onClose={() => setShowForm3(false)}
                        />
                        }
                        
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => { setActiveSubId(sub.id); setShowForm4(true)}}
                          className="!bg-blue-500 hover:!bg-blue-600"
                        >
                          Add Teachers
                        </Button>
                        {showForm4 && 
                        <ViewTeachers 
                        isForAdd
                        onSubmit={(selected) => {
                          handleAddTeachers(selected);
                          setShowForm4(false);
                        }}
                        onClose={() => setShowForm4(false)}
                        />
                        }
                      </div>
                    </div>
                  ))}
                </div>
        }


                {/* 3️⃣  “Add new subsection” button */}
                <Button
                  variant="outlined"
                  size="small"
                  className={section.subsections.length != 0 &&"!mt-3"}
                  onClick={() => setShowForm2(true)}
                >
                  + Add new subsection
                </Button>

                {showForm2 && (
                  <DynamicForm
                    fields={addSubSectionFormFields}
                    onSubmit={(formData) => handleAddSubsection(section.sectionId, formData)}
                    onClose={() => setShowForm2(false)}
                  />
                )}
              </AccordionDetails>
            </Accordion>
          </Box>
        ))}

        {/* 4️⃣  “Add new section” button */}
        <div className="flex justify-center mt-6">
          <Button variant="contained" onClick={() => setShowForm1(true)} className="!bg-green-500 hover:!bg-green-600">
            + Add new section
          </Button>
          {showForm1 && (
            <DynamicForm
              fields={addSectionFormFields}
              onSubmit={handleAddSection}
              onClose={() => setShowForm1(false)}
            />
          )}
        </div>
      </Container>
      {success && (
        <SuccessMessage
          title={success.title}
          message={success.message}
          onClose={() => setSuccess(null)}
        />
      )}
      {error && (
        <ErrorMessage
          title={error.title}
          message={error.message}
          onClose={() => setError(null)}
        />
      )}
    </Box>
  );
}


