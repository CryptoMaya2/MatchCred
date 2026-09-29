/**
 * CV Extractor Service for MatchCred
 * 
 * Supports:
 * - PDF documents (.pdf) via pdfjs-dist (with fallback stream extraction)
 * - Microsoft Word documents (.docx) via mammoth
 * - Plain text files (.txt) or direct CV text paste
 * - Sample CV scenarios for rapid exploration across disciplines
 * 
 * IMPORTANT VERIFICATION DISTINCTION:
 * Information extracted from a CV is candidate-provided evidence and must NOT
 * automatically be labeled or treated as an independently verified credential.
 */

import * as mammoth from 'mammoth';

// Safe dynamic PDF.js loader with client-side fallback
let pdfjsLib = null;
async function getPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  try {
    const mod = await import('pdfjs-dist');
    pdfjsLib = mod.default || mod;
    if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
    }
    return pdfjsLib;
  } catch (err) {
    console.warn('PDF.js dynamic import notice, will use stream fallback:', err);
    return null;
  }
}

/**
 * Extracts raw text from an ArrayBuffer of a PDF
 */
async function extractTextFromPdf(arrayBuffer) {
  try {
    const pdfjs = await getPdfJs();
    if (pdfjs && pdfjs.getDocument) {
      const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      if (fullText.trim().length > 20) {
        return fullText.trim();
      }
    }
  } catch (err) {
    console.warn('Standard PDF.js extraction encountered an issue, falling back to text decoder:', err);
  }

  // Fallback: extract ASCII/UTF-8 streams from PDF binary
  const bytes = new Uint8Array(arrayBuffer);
  let text = '';
  let inStream = false;
  let chunk = [];

  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    // Printable characters + whitespace
    if ((b >= 32 && b <= 126) || b === 10 || b === 13 || b === 9) {
      chunk.push(String.fromCharCode(b));
    } else if (chunk.length > 3) {
      text += chunk.join('') + ' ';
      chunk = [];
    } else {
      chunk = [];
    }
  }
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Extracts raw text from an ArrayBuffer of a DOCX file using mammoth
 */
async function extractTextFromDocx(arrayBuffer) {
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || '';
}

/**
 * Main CV File Parser: reads PDF, DOCX, or text files and returns structured CV data
 */
export async function parseCvFile(file) {
  if (!file) {
    throw new Error('No file provided for CV extraction.');
  }

  const filename = file.name || 'document';
  const extension = filename.split('.').pop().toLowerCase();
  let rawText = '';

  const arrayBuffer = await file.arrayBuffer();

  if (extension === 'docx') {
    rawText = await extractTextFromDocx(arrayBuffer);
  } else if (extension === 'pdf') {
    rawText = await extractTextFromPdf(arrayBuffer);
  } else if (extension === 'txt') {
    const decoder = new TextDecoder('utf-8');
    rawText = decoder.decode(arrayBuffer);
  } else {
    // Attempt text decode for any other plain format
    try {
      rawText = await file.text();
    } catch {
      throw new Error(`Unsupported file type ".${extension}". Please upload a PDF or DOCX file.`);
    }
  }

  if (!rawText || rawText.trim().length < 10) {
    throw new Error('Unable to extract readable text from the uploaded CV. Please ensure the file is not empty or password protected.');
  }

  const structured = extractStructuredCvData(rawText, filename);
  return structured;
}

/**
 * Parses raw text into structured CV sections:
 * - Education
 * - Work Experience (with computed duration and years)
 * - Skills
 * - Certifications
 * - Projects
 * - Volunteer Experience
 * - Leadership Experience
 * - Achievements
 */
export function extractStructuredCvData(rawText, sourceFileName = 'Uploaded CV') {
  if (!rawText || typeof rawText !== 'string') {
    return createEmptyCvData(sourceFileName);
  }

  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const education = [];
  const experience = [];
  const skillsSet = new Set();
  const certifications = [];
  const projects = [];
  const volunteer = [];
  const leadership = [];
  const achievements = [];

  // Track sections
  let currentSection = 'summary';
  const textLower = rawText.toLowerCase();

  const sectionHeaders = {
    education: /^(education|academic background|qualifications|academic history):?$/i,
    experience: /^(experience|work experience|employment history|work history|professional experience|employment):?$/i,
    skills: /^(skills|core competencies|technical skills|technical proficiencies|key skills):?$/i,
    certifications: /^(certifications?|licenses?|licensure|certificates?):?$/i,
    projects: /^(projects?|portfolio|personal projects?):?$/i,
    volunteer: /^(volunteer|community service|outreach|charity):?$/i,
    leadership: /^(leadership|extracurricular activities):?$/i
  };

  // Known skill dictionaries across tech, design, business, leadership, and public health
  const SKILL_KEYWORDS = [
    'React', 'TypeScript', 'JavaScript', 'Python', 'Node.js', 'Next.js', 'HTML', 'CSS',
    'Tailwind CSS', 'SQL', 'Git', 'AWS', 'Docker', 'GraphQL', 'REST API', 'PostgreSQL', 'MongoDB',
    'Figma', 'UI/UX Design', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems',
    'Data Analysis', 'Financial Modeling', 'Spreadsheets', 'Excel', 'Tableau', 'Power BI',
    'Project Management', 'Agile', 'Scrum', 'Strategic Planning', 'Risk Assessment',
    'Public Health', 'Community Outreach', 'Epidemiology', 'Health Education',
    'Team Leadership', 'Stakeholder Management', 'Public Speaking', 'Cross-Functional Collaboration',
    'Customer Service', 'Cash Handling', 'POS Systems', 'Inventory Management', 'Sales'
  ];

  for (const skill of SKILL_KEYWORDS) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(rawText)) {
      skillsSet.add(skill);
    }
  }

  const degreeKeywordRegex = /\b(diploma|degree|bachelor|bachelor's|bachelors|master|master's|masters|phd|doctorate|doctor|b\.?\s*sc|m\.?\s*sc|b\.?\s*a|m\.?\s*a|btech|associate|ged|matric|high\s*school\s*diploma)\b/i;
  const institutionRegex = /\b(university|college|institute|academy|polytechnic|high\s*school|school)\b/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is a section header
    let isHeader = false;
    for (const [sec, regex] of Object.entries(sectionHeaders)) {
      if (regex.test(line)) {
        currentSection = sec;
        isHeader = true;
        break;
      }
    }
    if (isHeader) continue;

    // Skills section parsing
    if (currentSection === 'skills' || /^(skills|technical skills|competencies):/i.test(line)) {
      const cleanLine = line.replace(/^(skills|technical skills|competencies):/i, '');
      const tokens = cleanLine.split(/[,;•|*]|\band\b/i).map(t => t.trim().replace(/^[-•*]\s*/, '')).filter(t => t.length > 1);
      tokens.forEach(t => skillsSet.add(t));
      continue;
    }

    // Education section or explicit degree line
    if (currentSection === 'education' || degreeKeywordRegex.test(line)) {
      const cleanLine = line.replace(/^(education|degree):\s*/i, '').replace(/^[•\-\*]\s*/, '').trim();

      // If line is an institution for the previously added degree (e.g. "City High School")
      if (education.length > 0 && !education[education.length - 1].institution && institutionRegex.test(cleanLine) && !degreeKeywordRegex.test(cleanLine)) {
        education[education.length - 1].institution = cleanLine;
        continue;
      }

      if (degreeKeywordRegex.test(cleanLine)) {
        let inst = '';
        let degName = cleanLine;

        // Check if institution is inline (e.g. "B.Sc. in Computer Science | University of Lagos" or "... from University of Lagos")
        const inlineSplit = cleanLine.split(/\s+[|–\-]\s+|\s+from\s+|\s+at\s+/i);
        if (inlineSplit.length > 1 && institutionRegex.test(inlineSplit[1])) {
          degName = inlineSplit[0].trim();
          inst = inlineSplit[1].replace(/\(.*?\)/g, '').trim();
        } else {
          // Check subsequent or prior line
          for (let j = Math.max(0, i - 1); j <= Math.min(lines.length - 1, i + 2); j++) {
            if (j !== i && institutionRegex.test(lines[j]) && !degreeKeywordRegex.test(lines[j])) {
              inst = lines[j].replace(/^[•\-\*]\s*/, '').trim();
              break;
            }
          }
        }
        const yearMatch = cleanLine.match(/\b(19\d{2}|20\d{2})\b/) || (lines[i + 1] && lines[i + 1].match(/\b(19\d{2}|20\d{2})\b/));
        education.push({
          id: 'edu-' + education.length,
          degree: degName,
          institution: inst || '',
          year: yearMatch ? yearMatch[0] : '',
          details: 'Candidate-reported academic credential'
        });
      }
      continue;
    }

    // Experience section parsing
    if (currentSection === 'experience' || /^(experience|employment):/i.test(line)) {
      const cleanLine = line.replace(/^(experience|employment):\s*/i, '').replace(/^[•\-\*]\s*/, '').trim();
      if (cleanLine.length > 2) {
        // Match "Role at Company (Duration)" or "Role | Company (Duration)" or "Role (Duration)"
        const roleMatch = cleanLine.match(/^(.+?)(?:\s+(?:at|@|\||-)\s+([^(]+?))?(?:\s*\((.+?)\))?$/i);
        if (roleMatch && roleMatch[1]) {
          const role = roleMatch[1].trim();
          const org = roleMatch[2] ? roleMatch[2].trim() : 'Documented Employer';
          const dur = roleMatch[3] ? roleMatch[3].trim() : 'Documented';

          let parsedYears = 1;
          const monthM = dur.match(/(\d+)\s*(?:months?|mos?)/i);
          const yearM = dur.match(/(\d+)\s*(?:years?|yrs?)/i);
          if (monthM) {
            parsedYears = parseFloat((parseInt(monthM[1], 10) / 12).toFixed(2));
          } else if (yearM) {
            parsedYears = parseInt(yearM[1], 10);
          }

          experience.push({
            id: 'exp-' + experience.length,
            role,
            organization: org,
            duration: dur,
            years: parsedYears,
            description: cleanLine
          });
          continue;
        }
      }
    }

    // Certification detection
    if (/\b(certificate|certified|certification|licence|license)\b/i.test(line) && !degreeKeywordRegex.test(line)) {
      const yearMatch = line.match(/\b(19\d{2}|20\d{2})\b/);
      certifications.push({
        id: 'cert-' + certifications.length,
        name: line.replace(/^[•\-\*]\s*/, '').trim(),
        issuer: 'Reported in CV',
        year: yearMatch ? yearMatch[0] : 'Reported'
      });
    }

    // Projects detection
    if (/^(project|portfolio|built|developed|designed|implemented):?/i.test(line) || /\b(github\.com|portfolio|case study)\b/i.test(line)) {
      projects.push({
        id: 'proj-' + projects.length,
        name: line.replace(/^[•\-\*]\s*/, '').slice(0, 60),
        description: line,
        tech: 'Extracted from CV'
      });
    }

    // Volunteer / Leadership detection
    if (/\b(volunteer|outreach|community service|charity)\b/i.test(line)) {
      volunteer.push({
        id: 'vol-' + volunteer.length,
        role: line.slice(0, 50),
        organization: 'Community / Volunteer Initiative',
        description: line
      });
    }

    if (/\b(lead|leader|president|director|chair|head of|coordinator|captain)\b/i.test(line) && !degreeKeywordRegex.test(line)) {
      leadership.push({
        id: 'lead-' + leadership.length,
        role: line.slice(0, 50),
        description: line
      });
    }
  }

  // Calculate total years of experience from parsed blocks or text
  let totalYearsDetected = 0;
  if (experience.length > 0) {
    totalYearsDetected = experience.reduce((sum, e) => sum + (e.years || 0), 0);
  } else {
    // Fallback: look for tenure phrases like "2 years", "6 months", "3+ years", "2021 - 2024"
    const expYearMatches = rawText.match(/\b(\d+)\+?\s*(years?|yrs?)\s*(of\s*)?(experience|in|as|tenure)?\b/gi) || [];
    for (const match of expYearMatches) {
      const num = parseInt(match.match(/\d+/)[0], 10);
      if (!isNaN(num) && num > 0 && num < 50) {
        totalYearsDetected = Math.max(totalYearsDetected, num);
      }
    }

    const expMonthMatches = rawText.match(/\b(\d+)\+?\s*(months?|mos?)\s*(of\s*)?(experience|in|as|tenure)?\b/gi) || [];
    for (const match of expMonthMatches) {
      const num = parseInt(match.match(/\d+/)[0], 10);
      if (!isNaN(num) && num > 0) {
        totalYearsDetected = Math.max(totalYearsDetected, parseFloat((num / 12).toFixed(2)));
      }
    }

    // Date ranges (e.g. 2022 - 2024, 2021 - Present)
    const dateRangeRegex = /\b(20\d{2}|19\d{2})\s*(?:-|–|to)\s*(20\d{2}|present|current)\b/gi;
    let rangeMatch;
    while ((rangeMatch = dateRangeRegex.exec(rawText)) !== null) {
      const startYear = parseInt(rangeMatch[1], 10);
      const endYear = rangeMatch[2].toLowerCase() === 'present' || rangeMatch[2].toLowerCase() === 'current'
        ? new Date().getFullYear()
        : parseInt(rangeMatch[2], 10);
      const diff = Math.max(1, endYear - startYear);
      totalYearsDetected = Math.max(totalYearsDetected, diff);
    }

    // Detect roles across broader job types (tech, retail, service, design, business, health)
    const commonRoles = [
      'Frontend Developer', 'Software Engineer', 'Web Developer', 'Full-Stack Developer',
      'Product Designer', 'UI/UX Designer', 'Product Manager', 'Business Analyst',
      'Data Analyst', 'Project Coordinator', 'Community Health Coordinator', 'Research Assistant',
      'Cashier', 'Customer Service Representative', 'Sales Associate', 'Barista', 'Store Associate'
    ];

    for (const role of commonRoles) {
      if (new RegExp(`\\b${role}\\b`, 'i').test(rawText)) {
        experience.push({
          id: 'exp-' + experience.length,
          role,
          organization: 'Documented in CV',
          duration: totalYearsDetected > 0 ? (totalYearsDetected < 1 ? `${Math.round(totalYearsDetected * 12)} months` : `${totalYearsDetected} years`) : 'Documented',
          years: totalYearsDetected > 0 ? totalYearsDetected : 1,
          description: `Candidate reported experience as ${role} in CV.`
        });
        break;
      }
    }
  }

  // If experience array is still empty but tenure was found
  if (experience.length === 0 && totalYearsDetected > 0) {
    experience.push({
      id: 'exp-0',
      role: 'Professional Experience',
      organization: 'Reported in CV',
      duration: totalYearsDetected < 1 ? `${Math.round(totalYearsDetected * 12)} months` : `${totalYearsDetected} years`,
      years: totalYearsDetected,
      description: `${totalYearsDetected} years documented tenure in candidate CV.`
    });
  }

  return {
    sourceFileName,
    sourceType: 'Candidate CV',
    isCandidateProvided: true,
    rawText,
    totalYearsExperience: totalYearsDetected,
    education,
    experience,
    skills: Array.from(skillsSet),
    certifications,
    projects,
    volunteer,
    leadership,
    achievements,
    extractedAt: new Date().toISOString()
  };
}

/**
 * Creates empty CV structure for manual population or fallback
 */
export function createEmptyCvData(sourceFileName = 'Manual CV Entry') {
  return {
    sourceFileName,
    sourceType: 'Candidate CV',
    isCandidateProvided: true,
    rawText: '',
    totalYearsExperience: 0,
    education: [],
    experience: [],
    skills: [],
    certifications: [],
    projects: [],
    volunteer: [],
    leadership: [],
    achievements: [],
    extractedAt: new Date().toISOString()
  };
}

/**
 * Diverse Realistic Sample CVs for instant testing
 */
export const SAMPLE_CVS = {
  tech: {
    key: 'tech',
    title: 'Frontend Developer CV',
    category: 'Technology',
    fileName: 'alex_chen_frontend_developer_cv.pdf',
    data: {
      sourceFileName: 'alex_chen_frontend_developer_cv.pdf',
      sourceType: 'Candidate CV',
      isCandidateProvided: true,
      totalYearsExperience: 2,
      education: [
        {
          id: 'edu-tech-1',
          degree: 'B.Sc. in Computer Science',
          institution: 'University of Lagos',
          year: '2025',
          details: 'Core courses: Data Structures, Distributed Systems, Software Engineering'
        }
      ],
      experience: [
        {
          id: 'exp-tech-1',
          role: 'Frontend Developer',
          organization: 'Modern Web Systems',
          duration: '2 years (2023 - 2025)',
          years: 2,
          description: 'Engineered responsive single-page web applications using React, TypeScript, and modern component architecture.'
        }
      ],
      skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS', 'Git', 'REST API', 'Figma'],
      certifications: [
        {
          id: 'cert-tech-1',
          name: 'Google UX Design Professional Certificate',
          issuer: 'Google Career Certificates',
          year: '2024'
        }
      ],
      projects: [
        {
          id: 'proj-tech-1',
          name: 'Interactive Design System & Component Library',
          description: 'Accessible UI component toolkit built with React and Tailwind CSS.',
          tech: 'React, TypeScript, CSS'
        }
      ],
      volunteer: [],
      leadership: [
        {
          id: 'lead-tech-1',
          role: 'Tech Club Open Source Lead',
          description: 'Mentored 20+ junior developers in version control and frontend best practices.'
        }
      ],
      achievements: ['Dean’s Honor List (2024)', 'Hackathon Finalist (Web3 Track, 2024)'],
      rawText: `ALEX CHEN
Frontend Software Developer
alex.chen.dev@example.com | Lagos, Nigeria

EDUCATION
B.Sc. in Computer Science | University of Lagos (Graduating 2025)

EXPERIENCE
Frontend Developer | Modern Web Systems (2023 - 2025, 2 years)
- Built scalable client-facing web applications using React and TypeScript.
- Optimized web page load times and component responsiveness.

SKILLS
React, TypeScript, JavaScript, HTML, CSS, Tailwind CSS, Git, REST API, Figma

CERTIFICATIONS
Google UX Design Professional Certificate (2024)`
    }
  },

  design: {
    key: 'design',
    title: 'Product Designer CV',
    category: 'Design',
    fileName: 'samira_patel_product_design_cv.docx',
    data: {
      sourceFileName: 'samira_patel_product_design_cv.docx',
      sourceType: 'Candidate CV',
      isCandidateProvided: true,
      totalYearsExperience: 2,
      education: [
        {
          id: 'edu-des-1',
          degree: 'Bachelor of Arts in Design',
          institution: 'National Design Academy',
          year: '2024',
          details: 'Major in Visual Communication & Interactive Media'
        }
      ],
      experience: [
        {
          id: 'exp-des-1',
          role: 'Associate Product Designer',
          organization: 'Creative Studio Labs',
          duration: '2 years (2023 - 2025)',
          years: 2,
          description: 'Created user journey maps, wireframes, high-fidelity prototypes, and interactive user testing scripts.'
        }
      ],
      skills: ['Figma', 'UI/UX Design', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'HTML/CSS'],
      certifications: [
        {
          id: 'cert-des-1',
          name: 'Google UX Design Professional Certificate',
          issuer: 'Google',
          year: '2024'
        }
      ],
      projects: [
        {
          id: 'proj-des-1',
          name: 'Civic Health Mobile App Redesign',
          description: 'Redesigned patient triage UI to improve task completion rates by 40%.',
          tech: 'Figma, Usability Testing'
        }
      ],
      volunteer: [
        {
          id: 'vol-des-1',
          role: 'Pro Bono Designer',
          organization: 'Community Health Outreach Alliance',
          description: 'Designed educational infographics and patient intake flyers.'
        }
      ],
      leadership: [],
      achievements: ['National Student Design Excellence Award (2024)'],
      rawText: `SAMIRA PATEL
Product & UI/UX Designer
samira.design@example.org

EDUCATION
Bachelor of Arts in Design | National Design Academy (2024)

EXPERIENCE
Associate Product Designer | Creative Studio Labs (2 years, 2023 - 2025)
- Led end-to-end design research, wireframing, and design system creation.

SKILLS
Figma, UI/UX Design, User Research, Wireframing, Prototyping, Design Systems

CERTIFICATIONS
Google UX Design Professional Certificate (2024)`
    }
  },

  scholarship: {
    key: 'scholarship',
    title: 'Global Leadership Scholar CV',
    category: 'Scholarship',
    fileName: 'tariq_mansour_leadership_cv.pdf',
    data: {
      sourceFileName: 'tariq_mansour_leadership_cv.pdf',
      sourceType: 'Candidate CV',
      isCandidateProvided: true,
      totalYearsExperience: 2,
      education: [
        {
          id: 'edu-sch-1',
          degree: 'Bachelor of Science in Economics',
          institution: 'University of Lagos',
          year: '2024',
          details: 'Graduated with First Class Honors'
        }
      ],
      experience: [
        {
          id: 'exp-sch-1',
          role: 'Community Outreach Coordinator',
          organization: 'Civic Action Network',
          duration: '2 years (2023 - 2025)',
          years: 2,
          description: 'Directed civic literacy and education programs across 12 local communities.'
        }
      ],
      skills: ['Team Leadership', 'Community Outreach', 'Stakeholder Management', 'Public Speaking', 'Strategic Planning', 'Data Analysis'],
      certifications: [],
      projects: [
        {
          id: 'proj-sch-1',
          name: 'Youth Civic Participation Initiative',
          description: 'Mobilized 500+ student volunteers for community advocacy.',
          tech: 'Project Leadership'
        }
      ],
      volunteer: [
        {
          id: 'vol-sch-1',
          role: 'Volunteer Mentor',
          organization: 'Future Leaders Mentorship Trust',
          description: 'Provided guidance to secondary school students.'
        }
      ],
      leadership: [
        {
          id: 'lead-sch-1',
          role: 'President, Student Economics Society',
          description: 'Organized national economics summit with 800+ attendees.'
        }
      ],
      achievements: ['University Leadership Medal (2024)', 'Best Undergraduate Thesis Award (2024)'],
      rawText: `TARIQ MANSOUR
Economics Graduate & Civic Coordinator
tariq.mansour@example.org

EDUCATION
Bachelor of Science in Economics | University of Lagos (2024, First Class)

EXPERIENCE
Community Outreach Coordinator | Civic Action Network (2 years, 2023 - 2025)
- Coordinated youth civic education programs and managed volunteer teams.

LEADERSHIP & VOLUNTEER
President | Student Economics Society (2023 - 2024)
Volunteer Mentor | Future Leaders Mentorship Trust (2024)

SKILLS
Team Leadership, Community Outreach, Strategic Planning, Public Speaking`
    }
  }
};
