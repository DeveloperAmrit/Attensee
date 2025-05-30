export const APIBase = 'https://attensee-backend.onrender.com/api';
export const flaskAPIBase = ' https://f1f5-43-204-232-92.ngrok-free.app:5000'

export const teacherHeaders = ['teacherId', 'name', 'email', 'faceimageurl', 'password'];
export const teacherSheetApi = `${APIBase}/teacher/uploadTeachers`;

export const studentHeaders = ['name','rollNumber', 'email', 'department', 'year', 'faceimageurl', 'admissionYear', 'password'];
export const studentSheetApi = `${APIBase}/student/uploadStudents`;