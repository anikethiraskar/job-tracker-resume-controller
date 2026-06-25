// LocalStorage Key Constants
const STORAGE_KEYS = {
    JOBS: 'careerhub_jobs',
    RESUMES: 'careerhub_resumes'
};

// Default Resume Content Seeds (Markdown format)
const DEFAULT_RESUME_V1 = `# John Doe
**Software Engineer** | john.doe@email.com | (123) 456-7890 | github.com/johndoe

## Summary
Passionate Software Engineer with 2+ years of experience building reliable and scalable web applications. Strong foundations in computer science, frontend development, and databases.

## Skills
- **Languages**: JavaScript (ES6+), Python, HTML5, CSS3, SQL
- **Frameworks & Libraries**: Node.js, Express, Vanilla JS
- **Tools & Databases**: Git, PostgreSQL, MongoDB, VS Code

## Experience
**Junior Developer** at TechCorp | *2024 - Present*
- Assisted in building client-facing web portals, improving page speed by 15%.
- Wrote clean, well-tested code in HTML/CSS/JavaScript and maintained backend REST endpoints.
- Collaborated in an agile team of 5 developers.

## Education
**B.S. in Computer Science** - State University | *2020 - 2024*
`;

const DEFAULT_RESUME_V2 = `# John Doe
**Frontend Developer** | john.doe@email.com | (123) 456-7890 | github.com/johndoe

## Summary
Specialized Frontend Engineer with 2+ years of experience crafting visually stunning, responsive, and highly accessible user interfaces. Expert in CSS layout models, animations, and modern JavaScript modules.

## Skills
- **Frontend**: JavaScript (ES6+), CSS Grid/Flexbox, HTML5 (Semantic), SVG, Canvas
- **Design & UI**: Responsive Web Design, Glassmorphism, Micro-animations, Figma
- **Tools**: Git, npm, Webpack, Chrome DevTools, CSS Preprocessors

## Experience
**Frontend Developer** at TechCorp | *2024 - Present*
- Redesigned core customer dashboard utilizing glassmorphism and modern CSS variables, increasing user engagement by 25%.
- Optimized asset loading and layout shifts, achieving a 98/100 Lighthouse performance score.
- Implemented responsive design across mobile, tablet, and desktop views.

## Education
**B.S. in Computer Science** - State University | *2020 - 2024*
`;

const DEFAULT_RESUME_V3 = `# John Doe
**Full-Stack Engineer** | john.doe@email.com | (123) 456-7890 | github.com/johndoe

## Summary
Versatile Full-Stack Engineer with 2+ years of professional experience across frontend design and backend systems. Experienced in architecting database structures and writing highly optimized API queries.

## Skills
- **Frontend**: JavaScript (ES6+), CSS Grid/Flexbox, HTML5, Single Page Apps
- **Backend & Databases**: Node.js, Express, Python, PostgreSQL, MongoDB, Redis
- **Cloud & DevOps**: Git, Docker, AWS (S3, EC2), RESTful APIs

## Experience
**Full-Stack Developer** at TechCorp | *2024 - Present*
- Developed a high-throughput data processing pipeline, reducing server response times by 30%.
- Integrated third-party payment gateways (Stripe) and authentication modules (OAuth2).
- Designed and maintained PostgreSQL schemas, optimizing complex JOIN queries for analytics.

## Education
**B.S. in Computer Science** - State University | *2020 - 2024*
`;

// Initial Resume Seed Data Array
const SEED_RESUMES = [
    {
        id: 'res-v1.0',
        version: 'v1.0',
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        content: DEFAULT_RESUME_V1,
        commitMessage: 'Initial Draft - General Software Engineer Resume'
    },
    {
        id: 'res-v1.1',
        version: 'v1.1',
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        content: DEFAULT_RESUME_V2,
        commitMessage: 'Frontend Focus - Added glassmorphic styling experience and UI skills'
    },
    {
        id: 'res-v1.2',
        version: 'v1.2',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        content: DEFAULT_RESUME_V3,
        commitMessage: 'Fullstack Focus - Documented database optimization and REST API skills'
    }
];

// Initial Job Applications Seed Data Array
const SEED_JOBS = [
    {
        id: 'job-1',
        company: 'Google',
        role: 'Frontend Engineer',
        salary: '$150,000 - $185,000',
        status: 'Interviewing',
        dateApplied: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 days ago
        resumeVersion: 'res-v1.1',
        notes: 'Initial recruiter screening went very well. Technical assessment scheduled next week. Review CSS Grid, Flexbox, and performance optimization.',
        url: 'https://careers.google.com'
    },
    {
        id: 'job-2',
        company: 'Stripe',
        role: 'Full Stack Engineer',
        salary: '$160,000 - $190,000',
        status: 'Applied',
        dateApplied: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days ago
        resumeVersion: 'res-v1.2',
        notes: 'Submitted resume v1.2 highlighting database scaling and integration experience. Waiting to hear back.',
        url: 'https://stripe.com/jobs'
    },
    {
        id: 'job-3',
        company: 'Netflix',
        role: 'UI Developer',
        salary: '$210,000 - $240,000',
        status: 'Wishlist',
        dateApplied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
        resumeVersion: 'res-v1.1',
        notes: 'Connected with a hiring manager on LinkedIn. Looking to apply once the referral is submitted.',
        url: 'https://jobs.netflix.com'
    },
    {
        id: 'job-4',
        company: 'Microsoft',
        role: 'Software Engineer II',
        salary: '$140,000 - $165,000',
        status: 'Offer',
        dateApplied: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 22 days ago
        resumeVersion: 'res-v1.0',
        notes: 'Recieved written offer! Reviewing stock options and benefits package. Need to reply by next Friday.',
        url: 'https://careers.microsoft.com'
    },
    {
        id: 'job-5',
        company: 'Amazon',
        role: 'Software Development Engineer I',
        salary: '$125,000 - $145,000',
        status: 'Rejected',
        dateApplied: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 28 days ago
        resumeVersion: 'res-v1.0',
        notes: 'Completed the online coding assessment and virtual loop. Interviewers gave feedback that they went with a candidate with slightly more cloud-native experience.',
        url: 'https://amazon.jobs'
    }
];

// Data layer helper methods
const StorageManager = {
    // Initialize storage with seeds if empty
    init() {
        if (!localStorage.getItem(STORAGE_KEYS.RESUMES)) {
            localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(SEED_RESUMES));
        }
        if (!localStorage.getItem(STORAGE_KEYS.JOBS)) {
            localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(SEED_JOBS));
        }
    },

    // Job CRUD helpers
    getJobs() {
        this.init();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS)) || [];
    },

    saveJobs(jobs) {
        localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    },

    addJob(job) {
        const jobs = this.getJobs();
        job.id = 'job-' + Date.now();
        jobs.push(job);
        this.saveJobs(jobs);
        return job;
    },

    updateJob(updatedJob) {
        const jobs = this.getJobs();
        const index = jobs.findIndex(j => j.id === updatedJob.id);
        if (index !== -1) {
            jobs[index] = updatedJob;
            this.saveJobs(jobs);
            return true;
        }
        return false;
    },

    deleteJob(jobId) {
        const jobs = this.getJobs();
        const filtered = jobs.filter(j => j.id !== jobId);
        this.saveJobs(filtered);
    },

    // Resume CRUD helpers
    getResumes() {
        this.init();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESUMES)) || [];
    },

    saveResumes(resumes) {
        localStorage.setItem(STORAGE_KEYS.RESUMES, JSON.stringify(resumes));
    },

    addResume(content, commitMessage) {
        const resumes = this.getResumes();
        
        // Calculate version number increment
        let newVersion = 'v1.0';
        if (resumes.length > 0) {
            // Sort by version strings descending to find latest
            const latest = resumes[resumes.length - 1];
            const verParts = latest.version.replace('v', '').split('.');
            let major = parseInt(verParts[0]);
            let minor = parseInt(verParts[1]);
            
            // Increment minor version by default
            minor += 1;
            newVersion = `v${major}.${minor}`;
        }

        const newResume = {
            id: 'res-' + newVersion,
            version: newVersion,
            timestamp: new Date().toISOString(),
            content: content,
            commitMessage: commitMessage || `Updated to version ${newVersion}`
        };

        resumes.push(newResume);
        this.saveResumes(resumes);
        return newResume;
    }
};

// Export to window object for modular access
window.StorageManager = StorageManager;
