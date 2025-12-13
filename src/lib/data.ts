
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
  

export const serviceProviders = [
    {
      id: 'user-1',
      name: 'Mohammed Sufyan Ali',
      username: 'sufyanali',
      collegeId: 'cbit',
      avatarId: 'avatar-car-1',
      tagline: 'Expert in React and Node.js with a passion for tutoring.',
      skills: ['Web Development', 'React', 'Node.js', 'Tutoring'],
      rating: 4.9,
      reviews: 32,
    },
    {
      id: 'user-2',
      name: 'Shahed Ali',
      username: 'shahedali',
      collegeId: 'osmania',
      avatarId: 'avatar-car-2',
      tagline: 'Creative graphic designer and branding specialist.',
      skills: ['Graphic Design', 'Logo Design', 'Branding', 'Illustration'],
      rating: 4.8,
      reviews: 18,
    },
    {
      id: 'user-3',
      name: 'Ayesha Firdous',
      username: 'ayesha.firdous',
      collegeId: 'st-francis',
      avatarId: 'avatar-flower-1',
      tagline: 'Professional photographer for events and portraits.',
      skills: ['Photography', 'Photo Editing', 'Event Coverage'],
      rating: 5.0,
      reviews: 45,
    }
];

export const serviceRequests = [
    {
        id: 'req-1',
        studentId: 'user-3',
        title: 'Need a Logo for my College Club',
        description: 'We are starting a new coding club and need a cool, modern logo. Our theme is "Code, Create, Conquer". Looking for something minimalist but impactful.',
        serviceType: 'Design',
        budget: 1500,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        skills: ['Logo Design', 'Graphic Design', 'Branding'],
        status: 'Open',
        providerId: null,
    },
    {
        id: 'req-2',
        studentId: 'user-1',
        title: 'Help with Python for Data Science',
        description: 'I am struggling with the Pandas and Matplotlib libraries for my data science course. I need a tutor for a few sessions to help me understand the concepts.',
        serviceType: 'Tutoring',
        budget: 3000,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        skills: ['Python', 'Data Science', 'Pandas', 'Tutoring'],
        status: 'Open',
        providerId: null,
    },
    {
        id: 'req-3',
        studentId: 'user-2',
        title: 'Graduation Photoshoot',
        description: 'Looking for a talented photographer to take some professional photos for my graduation. The ceremony is at Osmania University.',
        serviceType: 'Photography',
        budget: 5000,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
        skills: ['Photography', 'Portrait Photography', 'Photo Editing'],
        status: 'In Progress',
        providerId: 'user-3'
    },
    {
        id: 'req-4',
        studentId: 'user-1',
        title: 'Video Editing for a College Fest Promo',
        description: 'Need a short, punchy promo video for our upcoming college festival. We have the raw footage, just need someone to edit it together with music and graphics.',
        serviceType: 'Video',
        budget: 4000,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        skills: ['Video Editing', 'Adobe Premiere', 'After Effects'],
        status: 'Open',
        providerId: null,
    },
];


// This is the old mock data, kept for reference if needed during transition.
export const users: any[] = [];
