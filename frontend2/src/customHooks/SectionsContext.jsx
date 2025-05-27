import { createContext, useReducer, useContext, useEffect } from 'react';
import { APIBase } from '../data/data';

function addSubSection(sectionId, name, dispatch){
  const subsectionId = crypto.randomUUID();
  const token = localStorage.getItem("token");
  if(!token) throw new Error("Token not found");

  fetch(`${APIBase}/subsection/createsubsection`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({sectionId, subsectionId, name}),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Subsection added:", data);
      console.log("Called fetchsections from addSubSection")
      fetchSections(dispatch);
    })
    .catch((err) => {
      throw new Error("Failed to add subsection", err);
    });
}

function addSection(section,dispatch) {

  const sectionId = crypto.randomUUID();
  const token = localStorage.getItem("token");
  if(!token) throw new Error("Token not found");

  fetch(`${APIBase}/section/createsection`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({sectionId, ...section}),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Section added:", data);
      console.log("Called fetchsections from addSection")
      fetchSections(dispatch);
    })
    .catch((err) => {
      throw new Error("Failed to add section", err);
    });
}


function fetchSections(dispatch) {
  console.log("Fetching sections...");
  async function fetchSections_(dispatch) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${APIBase}/section/getallsections`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      console.log("Sections data:", data.sections);
      dispatch({ type: "set", sections: data.sections });
    } catch (err) {
      console.error("Fetch sections failed:", err);
    }
  }

  fetchSections_(dispatch);
}

const SectionsContext = createContext([]);
const SectionsDispatchContext = createContext([]);

export function SectionsProvider({ children }) {
  const [Sections, dispatch] = useReducer(SectionsReducer, loadinitialSections());

  useEffect(() => {
    localStorage.setItem('sections', JSON.stringify(Sections));
  }, [Sections]);

  useEffect(() => {
    fetchSections(dispatch);
  },[]);

  return (
    <SectionsContext.Provider value={{sections: Sections,addSection:addSection, addSubSection:addSubSection}}>
      <SectionsDispatchContext.Provider value={dispatch}>
        {children}
      </SectionsDispatchContext.Provider>
    </SectionsContext.Provider>
  );
}

export function useSectionsContext() {
  return useContext(SectionsContext);
}

export function useSectionsDispatchContext() {
  return useContext(SectionsDispatchContext);
}

function SectionsReducer(sections, action) {
  switch (action.type) {
    case 'set': {
      localStorage.setItem('sections', JSON.stringify(action.sections));
      return action.sections;
    }
    case 'clear': {
      localStorage.setItem('sections', JSON.stringify([]));
      return [];
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

function loadinitialSections() {
  const savedSections = localStorage.getItem('sections');
  return savedSections ? JSON.parse(savedSections) : [];
}
