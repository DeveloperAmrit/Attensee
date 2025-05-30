export const APIBase = 'https://attensee-backend.onrender.com/api';
export const flaskAPIBase = 'https://ec2-43-204-232-92.ap-south-1.compute.amazonaws.com:5000'

export const teacherHeaders = ['teacherId', 'name', 'email', 'faceimageurl', 'password'];
export const teacherSheetApi = `${APIBase}/teacher/uploadTeachers`;

export const studentHeaders = ['name','rollNumber', 'email', 'department', 'year', 'faceimageurl', 'admissionYear', 'password'];
export const studentSheetApi = `${APIBase}/student/uploadStudents`;