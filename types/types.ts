// interface Users {
//   id: string;
//   auth_id: string;
//   email: string;
//   name: string;
//   profile_photo: string | null;
// }

// interface Institues {
//   id: string;
//   name: string;
//   abbreviation_insti: string;
// }

// interface Departments {
//   id: string;
//   name: string;
//   abbreviation_depart: string;
//   institues: {
//     id: string;
//     name: string;
//     abbreviation_insti: string;
//   };
// }

// interface User_Role {
//   id: string;
//   users: {
//     id: string;
//     auth_id: string;
//     email: string;
//     name: string;
//     profile_photo: string | null;
//   };
//   role_name: string;
//   departments: {
//     id: string;
//     name: string;
//     abbreviation_depart: string;
//     institues: {
//       id: string;
//       name: string;
//       abbreviation_insti: string;
//     };
//   };
// }

// interface Subjects {
//   id: string;
//   code: string;
//   name: string;
//   semester: number;
//   lecture_hours: number;
//   lab_hours: number;
//   abbreviation_name: string;
//   credites: number;
//   departments: {
//     id: string;
//     name: string;
//     abbreviation_depart: string;
//     institues: {
//       id: string;
//       name: string;
//       abbreviation_insti: string;
//     };
//   };
//   is_practical: boolean;
//   is_theory: boolean;
// }

// interface Faculty_Subjects {
//   id: string;
//   faculty_id: string;
//   departments: {
//     id: string;
//     name: string;
//     abbreviation_depart: string;
//     institues: {
//       id: string;
//       name: string;
//       abbreviation_insti: string;
//     };
//   };
//   subjects: {
//     id: string;
//     code: string;
//     name: string;
//     semester: number;
//     lecture_hours: number;
//     lab_hours: number;
//     abbreviation_name: string;
//     credites: number;
//     departments: {
//       id: string;
//       name: string;
//       abbreviation_depart: string;
//       institues: {
//         id: string;
//         name: string;
//         abbreviation_insti: string;
//       };
//     };
//     is_practical: boolean;
//     is_theory: boolean;
//     academic_year: string;
//     divison: string;
//   };
// }

// export type { Users, Institues, Departments, User_Role, Subjects, Faculty_Subjects };

interface Users {
  id: string;
  auth_id: string;
  email: string;
  name: string;
  profile_photo: string | null;
}

interface Institues {
  id: string;
  name: string;
  abbreviation_insti: string;
}

interface Departments {
  id: string;
  name: string;
  abbreviation_depart: string;
  institues: {
    id: string;
    name: string;
    abbreviation_insti: string;
  };
}

interface Subjects {
  id: string;
  code: string;
  name: string;
  semester: number;
  lecture_hours: number;
  lab_hours: number;
  abbreviation_name: string;
  credites: number;
  departments: {
    id: string;
    name: string;
    abbreviation_depart: string;
    institues: {
      id: string;
      name: string;
      abbreviation_insti: string;
    };
  };
  is_practical: boolean;
  is_theory: boolean;
  academic_year?: string;
  division?: string;
}

interface User_Role {
  user_id(user_id: any): unknown;
  filter(arg0: (f: { users: { email: string } }) => boolean): unknown;
  depart_id: string | undefined;
  id: string;

  users: {
    id: string;
    auth_id: string;
    email: string;
    name: string;
    profile_photo: string | null;
  };
  role_name: string;
  departments: {
    id: string;
    name: string;
    abbreviation_depart: string;
    institues: {
      id: string;
      name: string;
      abbreviation_insti: string;
    };
  };
  subjects: Subjects;
  academic_year: string | null;
  division: string | null;
}

interface Faculty_Subjects {
  id: string;
  faculty_id: string;
  departments: {
    id: string;
    name: string;
    abbreviation_depart: string;
    institues: {
      id: string;
      name: string;
      abbreviation_insti: string;
    };
  };
  subjects: Subjects;
}
interface Student_data {
  student_id: string; // UUID from student_data table
  Roll_No: string | null;
  Student_Name: string | null;
  Gender: string | null;
  Birth_Date: string | null;
  Mobile_No: string | null;
  Guardian_Mobile: string | null;
  Guardian_Name: string | null;
  Counsellor: string | null;
  Guardian_Email: string | null;
  Division: number | null; // bigint in database
  Batch: string | null;
  Sem: number | null; // bigint in database
  Department: string | null;
}

interface Timetable {
  id?: string;
  day: string | null;
  type: string | null;
  subject: string | null; // UUID referencing subjects(id)
  faculty: string | null; // UUID referencing users(id)
  department: string | null; // UUID referencing departments(id)
  to: string | null; // Time with time zone format (e.g., "14:30:00+00")
  from: string | null; // Time with time zone format (e.g., "13:00:00+00")
  division: string | null;
  batch: string | null;
  sem: number | null;
  location: string | null; // Location/room where the lecture takes place
}

interface Attendance {
  id?: string;
  lecture: string; // UUID referencing timetable.id
  student_id: string; // UUID referencing student_data.student_id
  is_present: boolean;
  Date?: string; // timestamp with time zone
  faculty_id?: string; // UUID referencing users.id
  taken_at?: string; // timestamp with time zone, default: now()
  Remark?: string; // text field for remarks
}

export type {
  Users,
  Institues,
  Departments,
  User_Role,
  Subjects,
  Faculty_Subjects,
  Student_data,
  Timetable,
  Attendance,
};
