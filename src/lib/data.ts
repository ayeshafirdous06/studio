// This file contains mock data for prototyping purposes.
// In a real application, this data would be fetched from a database.

export const colleges = [
    {
      id: 'cbit',
      name: 'Chaitanya Bharathi Institute of Technology (CBIT)',
      collegeType: 'Engineering',
      city: 'Hyderabad',
      state: 'Telangana',
      approvalStatus: true,
    },
    {
      id: 'osmania',
      name: 'Osmania University',
      collegeType: 'Degree',
      city: 'Hyderabad',
      state: 'Telangana',
      approvalStatus: true,
    },
    {
      id: 'nizam',
      name: 'Nizam College',
      collegeType: 'Degree',
      city: 'Hyderabad',
      state: 'Telangana',
      approvalStatus: true,
    },
    {
      id: 'st-francis',
      name: 'St. Francis College for Women',
      collegeType: 'Women’s',
      city: 'Hyderabad',
      state: 'Telangana',
      approvalStatus: true,
    },
    {
      id: 'loyola',
      name: 'Loyola Academy',
      collegeType: 'Degree',
      city: 'Hyderabad',
      state: 'Telangana',
      approvalStatus: true,
    },
    {
      id: 'aurora',
      name: 'Aurora’s Degree & PG College',
      collegeType: 'Degree',
      city: 'Hyderabad',
      state: 'Telangana',
      approvalStatus: true,
    },
    {
      id: 'mjcet',
      name: 'Muffakham Jah College of Engineering and Technology',
      collegeType: 'Engineering',
      city: 'Hyderabad',
      state: 'Telangana',
      approvalStatus: true,
    },
    {
      id: 'stanley',
      name: 'Stanley College of Engineering and Technology for Women',
      collegeType: 'Women’s',
      city: 'Hyderabad',
      state: 'Telangana',
      approvalStatus: false, // Example of a non-approved college
    },
    {
      id: 'vasavi',
      name: 'Vasavi College of Engineering',
      collegeType: 'Engineering',
      city: 'Hyderabad',
      state: 'Telangana',
      approvalStatus: true,
    },
    {
      id: 'av-college',
      name: 'AV College of Arts, Science and Commerce',
      collegeType: 'Degree',
      city: 'Hyderabad',
      state: 'Telangana',
      approvalStatus: true,
    },
    {
      id: 'lords',
      name: 'Lords Institute of Engineering and Technology',
      collegeType: 'Engineering',
      city: 'Hyderabad',
      state: 'Telangana',
      approvalStatus: true,
    },
    {
      id: 'st-anns',
      name: 'St. Ann\'s College for Women',
      collegeType: 'Women’s',
      city: 'Hyderabad',
      state: 'Telangana',
      approvalStatus: true,
    },
  ];
  

export const users = [
  { id: '1', name: 'Mohammed Sufyan Ali', collegeId: 'cbit', rating: 4.8, earnings: 1250.00, avatarId: 'avatar-1' },
  { id: '2', name: 'Shahed Ali', collegeId: 'cbit', rating: 4.5, earnings: 800.00, avatarId: 'avatar-2' },
  { id: '3', name: 'Ayesha Firdous', collegeId: 'osmania', rating: 4.9, earnings: 2100.00, avatarId: 'avatar-3' },
  { id: '4', name: 'Diana Miller', collegeId: 'nizam', rating: 4.7, earnings: 550.00, avatarId: 'avatar-4' },
];

export const serviceRequests = [
    {
        id: 'req-1',
        title: 'Need a tutor for Calculus II',
        description: 'I am struggling with integration techniques and series. Looking for someone who has aced this course to help me prepare for my final exam. We can meet twice a week for 2-hour sessions.',
        serviceType: 'Tutoring',
        budget: 150,
        deadline: new Date(new Date().setDate(new Date().getDate() + 14)),
        studentId: '4',
        status: 'Open',
        skills: ['Calculus', 'Mathematics', 'Tutoring', 'Problem Solving']
    },
    {
        id: 'req-2',
        title: 'Design a logo for our new student club',
        description: 'Our new "Innovators Hub" club needs a modern and sleek logo. We want it to represent technology and creativity. Please provide a portfolio of your previous work.',
        serviceType: 'Design',
        budget: 50,
        deadline: new Date(new Date().setDate(new Date().getDate() + 7)),
        studentId: '1',
        status: 'Open',
        skills: ['Graphic Design', 'Logo Design', 'Adobe Illustrator', 'Branding']
    },
    {
        id: 'req-3',
        title: 'Photoshoot for graduation pictures',
        description: 'Looking for a talented photographer to take my graduation photos around campus. Should include about 1-2 hours of shooting and 20 edited digital photos.',
        serviceType: 'Photography',
        budget: 100,
        deadline: new Date(new Date().setDate(new Date().getDate() + 30)),
        studentId: '2',
        status: 'In Progress',
        skills: ['Photography', 'Photo Editing', 'Portrait Photography', 'Lightroom']
    },
];

export const serviceProviders = [
  {
    studentId: '3',
    tagline: 'Full-stack developer & CS Tutor',
    skills: ['React', 'Node.js', 'Python', 'Data Structures', 'Algorithms'],
  },
  {
    studentId: '1',
    tagline: 'Creative Graphic Designer',
    skills: ['Adobe Photoshop', 'Illustration', 'UI/UX Design', 'Branding'],
  },
  {
    studentId: '2',
    tagline: 'Aspiring writer and editor',
    skills: ['Copywriting', 'Proofreading', 'Creative Writing', 'Content Strategy'],
  },
];
