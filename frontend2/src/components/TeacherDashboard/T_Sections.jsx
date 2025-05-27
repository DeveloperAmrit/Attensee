import { useEffect, useState } from 'react';
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
import SuccessMessage from '../shared/success';
import ErrorMessage from '../shared/error';
import { APIBase } from '../../data/data';
import { useUserContext } from '../../customHooks/UserContext';



export default function T_Section() {
  const [expanded, setExpanded] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = useUserContext();


  useEffect(()=>{
    async function getTeacherSections(){
      setLoading(true);

      const token = localStorage.getItem('token')
      try{
        const resposne = await fetch(`${APIBase}/teacher/getTSections`,{
          method: "POST",
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({username: user.username})
        })
        const data = await resposne.json();
        setSections(data.sections);
      }
      catch(error){
        console.log(error);
        alert("Error fetching assigned sections")
      }
      finally{
        setLoading(false);
      }

    }
    getTeacherSections();
  },[])

  const handleChange = (panel) => (_, isExpanded) =>
    setExpanded(isExpanded ? panel : false);


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

  if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
    );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {sections.length == 0 ? "No sections assigned" : "Sections"}
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
                      </div>
                    </div>
                  ))}
                </div>
        }
              </AccordionDetails>
            </Accordion>
          </Box>
        ))}
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


