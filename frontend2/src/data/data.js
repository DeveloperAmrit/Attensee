export const APIBase = 'https://attensee-backend.onrender.com/api';
export const flaskAPIBase = 'http://localhost:5001'

export const teacherHeaders = ['teacherId', 'name', 'email', 'faceimageurl', 'password'];
export const teacherSheetApi = `${APIBase}/teacher/uploadTeachers`;

export const studentHeaders = ['name','rollNumber', 'email', 'department', 'year', 'faceimageurl', 'admissionYear', 'password'];
export const studentSheetApi = `${APIBase}/student/uploadStudents`;