const TrackerController = {
    draggedJobId: null,

    init() {
        this.registerEventListeners();
        this.renderTracker();
    },

    renderTracker() {
        const jobs = window.StorageManager.getJobs();
        const resumes = window.StorageManager.getResumes();

        this.populateResumeDropdowns(resumes);
        this.populateResumeFilter(resumes);
        this.renderBoard(jobs);
    },

    registerEventListeners() {
        // Drag and drop events for columns
        const columns = document.querySelectorAll('.kanban-column');
        columns.forEach(col => {
            col.addEventListener('dragover', (e) => this.handleDragOver(e, col));
            col.addEventListener('dragleave', () => this.handleDragLeave(col));
            col.addEventListener('drop', (e) => this.handleDrop(e, col));
        });

        // Search, filter, and sort listeners
        document.getElementById('job-search').addEventListener('input', () => this.filterAndRender());
        document.getElementById('resume-filter').addEventListener('change', () => this.filterAndRender());
        document.getElementById('job-sort').addEventListener('change', () => this.filterAndRender());

        // Drawer open/close events
        document.getElementById('global-add-job-btn').addEventListener('click', () => this.openJobDrawer());
        document.getElementById('job-drawer-close').addEventListener('click', () => this.closeJobDrawer());
        document.getElementById('job-form-cancel-btn').addEventListener('click', () => this.closeJobDrawer());
        document.getElementById('job-drawer-overlay').addEventListener('click', () => this.closeJobDrawer());

        // Form submit & delete events
        document.getElementById('job-form').addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.getElementById('job-form-delete-btn').addEventListener('click', () => this.handleDeleteJob());

        // Smart Paste input listener
        const pasteArea = document.getElementById('job-form-paste-area');
        if (pasteArea) {
            pasteArea.addEventListener('input', (e) => this.handleSmartPaste(e));
        }
    },

    populateResumeDropdowns(resumes) {
        const dropdown = document.getElementById('job-form-resume');
        if (!dropdown) return;

        dropdown.innerHTML = '<option value="">None (No Resume Linked)</option>';
        resumes.forEach(r => {
            dropdown.innerHTML += `<option value="${r.id}">${r.version} - ${r.commitMessage}</option>`;
        });
    },

    populateResumeFilter(resumes) {
        const filter = document.getElementById('resume-filter');
        if (!filter) return;

        // Keep current selected value
        const currentVal = filter.value;

        filter.innerHTML = '<option value="">All Resumes</option>';
        resumes.forEach(r => {
            filter.innerHTML += `<option value="${r.id}">${r.version}</option>`;
        });

        filter.value = currentVal;
    },

    filterAndRender() {
        const jobs = window.StorageManager.getJobs();
        const searchQuery = document.getElementById('job-search').value.toLowerCase().trim();
        const resumeFilter = document.getElementById('resume-filter').value;
        const sortOrder = document.getElementById('job-sort').value;

        // Apply filters
        let filteredJobs = jobs.filter(job => {
            const matchesSearch = job.company.toLowerCase().includes(searchQuery) || 
                                  job.role.toLowerCase().includes(searchQuery) ||
                                  (job.notes && job.notes.toLowerCase().includes(searchQuery));
            
            const matchesResume = resumeFilter === '' || job.resumeVersion === resumeFilter;

            return matchesSearch && matchesResume;
        });

        // Apply sorting
        filteredJobs.sort((a, b) => {
            if (sortOrder === 'date-desc') {
                return new Date(b.dateApplied) - new Date(a.dateApplied);
            } else if (sortOrder === 'date-asc') {
                return new Date(a.dateApplied) - new Date(b.dateApplied);
            } else if (sortOrder === 'company-asc') {
                return a.company.localeCompare(b.company);
            }
            return 0;
        });

        this.renderBoard(filteredJobs);
    },

    renderBoard(jobs) {
        // Clear all columns
        const columns = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'];
        columns.forEach(col => {
            const container = document.querySelector(`.column-cards[data-status="${col}"]`);
            if (container) container.innerHTML = '';
            
            const countEl = document.getElementById(`count-${col}`);
            if (countEl) countEl.textContent = '0';
        });

        // Track counts
        const colCounts = { Wishlist: 0, Applied: 0, Interviewing: 0, Offer: 0, Rejected: 0 };
        const resumes = window.StorageManager.getResumes();

        // Populate cards
        jobs.forEach(job => {
            if (colCounts[job.status] !== undefined) {
                colCounts[job.status]++;
                
                const container = document.querySelector(`.column-cards[data-status="${job.status}"]`);
                if (container) {
                    const card = this.createJobCard(job, resumes);
                    container.appendChild(card);
                }
            }
        });

        // Update counts
        columns.forEach(col => {
            const countEl = document.getElementById(`count-${col}`);
            if (countEl) countEl.textContent = colCounts[col];
        });
    },

    createJobCard(job, resumes) {
        const card = document.createElement('div');
        card.className = 'job-card glass';
        card.draggable = true;
        card.dataset.id = job.id;

        // Find linked resume version text
        const linkedResume = resumes.find(r => r.id === job.resumeVersion);
        const resumeTagHtml = linkedResume ? `
            <div class="job-resume-tag">
                <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span>${linkedResume.version}</span>
            </div>
        ` : '';

        card.innerHTML = `
            <div class="job-header">
                <span class="job-company">${job.company}</span>
                <div class="job-card-actions">
                    <button class="job-card-btn edit-btn" title="Edit Application">
                        <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg>
                    </button>
                </div>
            </div>
            <div class="job-role">${job.role}</div>
            
            <div class="job-meta-row">
                <span class="job-salary">${job.salary || 'Salary: N/A'}</span>
                <span class="job-date">
                    <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>${this.formatDate(job.dateApplied)}</span>
                </span>
            </div>
            ${resumeTagHtml}
        `;

        // Card action listeners
        card.addEventListener('dragstart', (e) => this.handleDragStart(e, job.id));
        card.addEventListener('dragend', () => this.handleDragEnd(card));
        
        const editBtn = card.querySelector('.edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openJobDrawer(job);
        });

        // Double click to edit too
        card.addEventListener('dblclick', () => this.openJobDrawer(job));

        return card;
    },

    formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const year = parts[0].substring(2);
        const month = months[parseInt(parts[1]) - 1];
        const day = parseInt(parts[2]);
        
        return `${day} ${month} '${year}`;
    },

    // HTML5 Drag and Drop Handlers
    handleDragStart(e, jobId) {
        this.draggedJobId = jobId;
        e.dataTransfer.setData('text/plain', jobId);
        
        // Timeout to apply opacity class after drag clone is made
        setTimeout(() => {
            const card = document.querySelector(`.job-card[data-id="${jobId}"]`);
            if (card) card.classList.add('dragging');
        }, 0);
    },

    handleDragEnd(card) {
        card.classList.remove('dragging');
        this.draggedJobId = null;
    },

    handleDragOver(e, col) {
        e.preventDefault();
        col.classList.add('drag-over');
    },

    handleDragLeave(col) {
        col.classList.remove('drag-over');
    },

    handleDrop(e, col) {
        e.preventDefault();
        col.classList.remove('drag-over');
        
        const jobId = e.dataTransfer.getData('text/plain') || this.draggedJobId;
        const newStatus = col.dataset.status;

        if (jobId && newStatus) {
            const jobs = window.StorageManager.getJobs();
            const job = jobs.find(j => j.id === jobId);
            
            if (job && job.status !== newStatus) {
                job.status = newStatus;
                window.StorageManager.updateJob(job);
                
                // Refresh board & dashboard charts
                this.filterAndRender();
                if (window.DashboardController) {
                    window.DashboardController.updateDashboard();
                }
            }
        }
    },

    // Job Drawer Form Handlers
    openJobDrawer(job = null) {
        const overlay = document.getElementById('job-drawer-overlay');
        const drawer = document.getElementById('job-drawer');
        const form = document.getElementById('job-form');
        const deleteBtn = document.getElementById('job-form-delete-btn');
        const titleEl = document.getElementById('drawer-title-text');

        form.reset();

        const pasteArea = document.getElementById('job-form-paste-area');
        if (pasteArea) {
            pasteArea.value = '';
        }
        const successMsg = document.getElementById('paste-success-msg');
        if (successMsg) {
            successMsg.style.display = 'none';
        }

        if (job) {
            // Edit application
            titleEl.textContent = 'Edit Job Application';
            document.getElementById('job-form-id').value = job.id;
            document.getElementById('job-form-company').value = job.company;
            document.getElementById('job-form-role').value = job.role;
            document.getElementById('job-form-status').value = job.status;
            document.getElementById('job-form-date').value = job.dateApplied || new Date().toISOString().split('T')[0];
            document.getElementById('job-form-salary').value = job.salary || '';
            document.getElementById('job-form-resume').value = job.resumeVersion || '';
            document.getElementById('job-form-url').value = job.url || '';
            document.getElementById('job-form-notes').value = job.notes || '';
            
            deleteBtn.style.display = 'block';
        } else {
            // New application
            titleEl.textContent = 'Add Job Application';
            document.getElementById('job-form-id').value = '';
            document.getElementById('job-form-date').value = new Date().toISOString().split('T')[0];
            
            deleteBtn.style.display = 'none';
        }

        overlay.classList.add('active');
        drawer.classList.add('active');
    },

    closeJobDrawer() {
        document.getElementById('job-drawer-overlay').classList.remove('active');
        document.getElementById('job-drawer').classList.remove('active');
    },

    handleFormSubmit(e) {
        e.preventDefault();

        const jobId = document.getElementById('job-form-id').value;
        const jobData = {
            company: document.getElementById('job-form-company').value.trim(),
            role: document.getElementById('job-form-role').value.trim(),
            status: document.getElementById('job-form-status').value,
            dateApplied: document.getElementById('job-form-date').value,
            salary: document.getElementById('job-form-salary').value.trim(),
            resumeVersion: document.getElementById('job-form-resume').value,
            url: document.getElementById('job-form-url').value.trim(),
            notes: document.getElementById('job-form-notes').value.trim()
        };

        if (jobId) {
            // Update
            jobData.id = jobId;
            window.StorageManager.updateJob(jobData);
        } else {
            // Create
            window.StorageManager.addJob(jobData);
        }

        this.closeJobDrawer();
        this.filterAndRender();

        if (window.DashboardController) {
            window.DashboardController.updateDashboard();
        }
    },

    handleDeleteJob() {
        const jobId = document.getElementById('job-form-id').value;
        if (jobId) {
            const company = document.getElementById('job-form-company').value;
            if (confirm(`Are you sure you want to delete your application for ${company}?`)) {
                window.StorageManager.deleteJob(jobId);
                this.closeJobDrawer();
                this.filterAndRender();

                if (window.DashboardController) {
                    window.DashboardController.updateDashboard();
                }
            }
        }
    },

    handleSmartPaste(e) {
        const text = e.target.value.trim();
        if (!text) return;

        const details = this.parseJobDescriptionText(text);
        let success = false;
        
        if (details.company) {
            document.getElementById('job-form-company').value = details.company;
            success = true;
        }
        if (details.role) {
            document.getElementById('job-form-role').value = details.role;
            success = true;
        }
        if (details.salary) {
            document.getElementById('job-form-salary').value = details.salary;
            success = true;
        }
        
        const notesInput = document.getElementById('job-form-notes');
        if (notesInput && !notesInput.value) {
            notesInput.value = text;
        }

        const successMsg = document.getElementById('paste-success-msg');
        if (successMsg && success) {
            successMsg.style.display = 'block';
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 6000);
        }
    },

    parseJobDescriptionText(text) {
        if (!text) return {};
        
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const result = {};

        // Helper to clean common label prefixes
        const cleanPrefix = (str, prefixes) => {
            let cleaned = str;
            for (let p of prefixes) {
                const regex = new RegExp(`^${p}\\s*:\\s*`, 'i');
                cleaned = cleaned.replace(regex, '');
            }
            return cleaned.trim();
        };

        const rolePrefixes = ['job title', 'role', 'position', 'title'];
        const companyPrefixes = ['company', 'organization', 'employer', 'company name'];

        // 1. Role Title Heuristics (scan first 15 lines)
        const titleKeywords = ['developer', 'engineer', 'analyst', 'manager', 'lead', 'architect', 'designer', 'intern', 'sde', 'programmer', 'specialist', 'consultant', 'coder'];
        let titleIndex = -1;
        for (let i = 0; i < Math.min(lines.length, 15); i++) {
            const line = lines[i];
            
            // If the line explicitly starts with a prefix like "Job Title: ..."
            const cleaned = cleanPrefix(line, rolePrefixes);
            if (cleaned !== line && cleaned.length < 50) {
                result.role = cleaned;
                titleIndex = i;
                break;
            }

            if (titleKeywords.some(kw => line.toLowerCase().includes(kw)) && line.length < 50) {
                result.role = cleanPrefix(line, rolePrefixes);
                titleIndex = i;
                break;
            }
        }

        // 2. Company Name Heuristics
        // Heuristic A: Look for explicit prefixes like "Company: Google"
        for (let i = 0; i < Math.min(lines.length, 12); i++) {
            const line = lines[i];
            const cleaned = cleanPrefix(line, companyPrefixes);
            if (cleaned !== line && cleaned.length < 35) {
                result.company = cleaned;
                break;
            }
        }

        // Heuristic B: Look for regex patterns ("at [Company]", "about [Company]")
        if (!result.company) {
            const companyRegexes = [
                /at\s+([A-Z][a-zA-Z0-9\s\.\,\-\&]{1,30})(?:\s+|$)/,
                /about\s+([A-Z][a-zA-Z0-9\s\.\,\-\&]{1,30})(?:\s+|$)/,
                /^([A-Z][a-zA-Z0-9\s\.\,\-\&]{1,30})\s*[\-|·•]\s*(?:Job|Careers|Hiring|Opportunity)/i
            ];
            for (let i = 0; i < Math.min(lines.length, 12); i++) {
                const line = lines[i];
                for (let regex of companyRegexes) {
                    const match = line.match(regex);
                    if (match && match[1]) {
                        result.company = match[1].trim();
                        break;
                    }
                }
                if (result.company) break;
            }
        }

        // Heuristic C: Check adjacent lines around the job title (up to 2 lines below)
        if (!result.company && titleIndex !== -1) {
            const candidates = [
                lines[titleIndex + 1],
                lines[titleIndex + 2],
                lines[titleIndex - 1]
            ].filter(Boolean);

            for (let cand of candidates) {
                cand = cleanPrefix(cand, companyPrefixes);
                
                // If it contains a dot, bullet, pipe, or dash (e.g. "Vianera · Pune")
                if (/[·•\-\–\|]/.test(cand)) {
                    const parts = cand.split(/[·•\-\–\|]/);
                    const compPart = parts[0].trim();
                    if (compPart.length < 35 && !/remote|hybrid|onsite|contract|full-time|part-time/i.test(compPart)) {
                        result.company = compPart;
                        break;
                    }
                }
                
                // If it contains a comma (e.g. "Vianera, Pune")
                if (cand.includes(',')) {
                    const parts = cand.split(',');
                    const compPart = parts[0].trim();
                    if (compPart.length < 35 && !/remote|hybrid|onsite|contract|full-time|part-time/i.test(compPart)) {
                        result.company = compPart;
                        break;
                    }
                }

                // Normal check for single company name lines
                if (cand.length < 35 && !/remote|hybrid|onsite|contract|full-time|part-time|\d+/i.test(cand)) {
                    result.company = cand;
                    break;
                }
            }
        }

        // Heuristic D: Look for company description headers (like "Company Description" in user's text)
        if (!result.company) {
            const descHeaders = ['company description', 'about the company', 'about us', 'who we are', 'about the job'];
            for (let i = 0; i < Math.min(lines.length, 15); i++) {
                const line = lines[i].toLowerCase();
                if (descHeaders.some(h => line.includes(h))) {
                    for (let offset = 1; offset <= 2; offset++) {
                        const nextLine = lines[i + offset];
                        if (nextLine && nextLine.length < 45 && !nextLine.includes(':') && !/remote|hybrid|onsite/i.test(nextLine)) {
                            if (/^[A-Z]/.test(nextLine)) {
                                result.company = nextLine.replace(/\s+is\s+a\b.*/i, '').trim(); // Strip "is a..." suffix
                                break;
                            }
                        }
                    }
                }
                if (result.company) break;
            }
        }

        // Heuristic E: Look for "[Company Name] is a..." anywhere in the first 10 lines
        if (!result.company) {
            const isARegex = /^([A-Z][a-zA-Z0-9\s\.\,\-\&]{1,40})\s+is\s+(?:a|an|the|prominent|leading|global)\b/i;
            for (let i = 0; i < Math.min(lines.length, 10); i++) {
                const match = lines[i].match(isARegex);
                if (match && match[1]) {
                    result.company = match[1].trim();
                    break;
                }
            }
        }

        // Heuristic F: If still nothing, look at the first line for splits
        if (!result.company && lines[0] && lines[0].includes(' - ')) {
            const parts = lines[0].split(' - ');
            if (parts[0] && parts[0].length < 30) {
                result.company = parts[0].trim();
            }
        }

        // 3. Salary Heuristics (Support $, €, £, and Indian Rupee ₹)
        const salaryRegex = /(?:[\$\£\€\₹]\d{1,3}(?:\,\d{3})*(?:\s*k)?\s*[\-\–]\s*[\$\£\€\₹]\d{1,3}(?:\,\d{3})*(?:\s*k)?|[\$\£\€\₹]\d{1,3}(?:\,\d{3})*(?:\s*k)?\s*\/yr|[\$\£\€\₹]\d{1,3}(?:\,\d{3})*(?:\s*k)?\s*annually)/gi;
        
        // Support general Lakhs Per Annum (LPA) or Rupees ranges: e.g. "3,00,000 - 5,00,000" or "6 - 12 LPA"
        const genericRangeRegex = /(\b\d{1,3}(?:\,\d{2,3})*(?:\s*k)?\s*[\-\–]\s*\d{1,3}(?:\,\d{2,3})*(?:\s*k)?\s*(?:INR|USD|Rs\.?|rupees|lpa|lakhs|annum|per year|/yr)\b)/i;

        const fullText = text.replace(/\n/g, ' ');
        let match = fullText.match(salaryRegex);
        if (match && match[0]) {
            result.salary = match[0].trim();
        } else {
            match = fullText.match(genericRangeRegex);
            if (match && match[0]) {
                result.salary = match[0].trim();
            }
        }

        return result;
    }
};

window.TrackerController = TrackerController;
