export const APIBase = 'https://attensee-backend.onrender.com/api';
export const flaskAPIBase = 'http://ec2-13-201-129-103.ap-south-1.compute.amazonaws.com:5000'

export const teacherHeaders = ['teacherId', 'name', 'email', 'faceimageurl', 'password'];
export const teacherSheetApi = `${APIBase}/teacher/uploadTeachers`;

export const studentHeaders = ['name','rollNumber', 'email', 'department', 'year', 'faceimageurl', 'admissionYear', 'password'];
export const studentSheetApi = `${APIBase}/student/uploadStudents`;