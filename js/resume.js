const ResumeController = {
    init() {
        this.registerEventListeners();
        this.renderResumeSection();
    },

    renderResumeSection() {
        const resumes = window.StorageManager.getResumes();
        this.populateVersionSelects(resumes);
        
        // Load latest resume version by default
        if (resumes.length > 0) {
            const latest = resumes[resumes.length - 1];
            document.getElementById('resume-version-select').value = latest.id;
            this.loadResumeVersion(latest);
        }
    },

    registerEventListeners() {
        const editor = document.getElementById('resume-markdown-editor');
        
        // Live preview on typing
        editor.addEventListener('input', () => {
            this.updatePreview(editor.value);
        });

        // Version selection change
        document.getElementById('resume-version-select').addEventListener('change', (e) => {
            const resumes = window.StorageManager.getResumes();
            const selected = resumes.find(r => r.id === e.target.value);
            if (selected) {
                this.loadResumeVersion(selected);
            }
        });

        // Save new version
        document.getElementById('save-resume-version-btn').addEventListener('click', () => this.handleSaveVersion());

        // Print/Download PDF
        document.getElementById('export-pdf-btn').addEventListener('click', () => this.handleDownloadPDF());

        // Diff modal events
        document.getElementById('compare-versions-btn').addEventListener('click', () => this.openDiffModal());
        document.getElementById('diff-modal-close').addEventListener('click', () => this.closeDiffModal());
        document.getElementById('diff-modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'diff-modal-overlay') this.closeDiffModal();
        });

        // Diff version selectors change
        document.getElementById('diff-ver-a').addEventListener('change', () => this.renderDiffView());
        document.getElementById('diff-ver-b').addEventListener('change', () => this.renderDiffView());

        // File upload trigger and change handler
        const fileUploadInput = document.getElementById('resume-file-upload');
        const triggerUploadBtn = document.getElementById('trigger-upload-btn');

        if (triggerUploadBtn && fileUploadInput) {
            triggerUploadBtn.addEventListener('click', () => fileUploadInput.click());
            fileUploadInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }
    },

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            const editor = document.getElementById('resume-markdown-editor');
            const commitMsgInput = document.getElementById('resume-commit-message');

            editor.value = content;
            this.updatePreview(content);
            commitMsgInput.value = `Uploaded: ${file.name}`;
            
            // Reset the file input so the same file can be uploaded again if needed
            e.target.value = '';
        };
        reader.readAsText(file);
    },

    populateVersionSelects(resumes) {
        const mainSelect = document.getElementById('resume-version-select');
        const diffA = document.getElementById('diff-ver-a');
        const diffB = document.getElementById('diff-ver-b');

        if (!mainSelect) return;

        // Keep selections if possible
        const mainVal = mainSelect.value;
        const diffAVal = diffA ? diffA.value : '';
        const diffBVal = diffB ? diffB.value : '';

        // Clear
        mainSelect.innerHTML = '';
        if (diffA) diffA.innerHTML = '';
        if (diffB) diffB.innerHTML = '';

        resumes.forEach(r => {
            const optHtml = `<option value="${r.id}">${r.version} (${this.formatShortDate(r.timestamp)})</option>`;
            mainSelect.innerHTML += optHtml;
            if (diffA) diffA.innerHTML += optHtml;
            if (diffB) diffB.innerHTML += optHtml;
        });

        // Restore value
        if (mainVal) mainSelect.value = mainVal;
        if (diffAVal && diffA) diffA.value = diffAVal;
        if (diffBVal && diffB) diffB.value = diffBVal;
    },

    loadResumeVersion(resume) {
        const editor = document.getElementById('resume-markdown-editor');
        editor.value = resume.content;
        this.updatePreview(resume.content);
        document.getElementById('resume-commit-message').value = '';
    },

    updatePreview(markdown) {
        const previewContainer = document.getElementById('resume-rendered-html');
        if (previewContainer) {
            previewContainer.innerHTML = this.parseMarkdown(markdown);
        }
    },

    formatShortDate(isoString) {
        const date = new Date(isoString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear().toString().substring(2)}`;
    },

    // Simple robust Regex-based Markdown Parser
    parseMarkdown(md) {
        if (!md) return '';
        
        let html = md
            // Escape HTML entities to prevent rendering breaks
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // 1. Headers
        html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
        html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
        html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');

        // 2. Bold & Italic
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.*?)_/g, '<em>$1</em>');

        // 3. Links
        html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

        // 4. Bullet lists: Match lines starting with - or * and group them
        // Let's replace each bullet line first with <li>item</li>
        html = html.replace(/^[-\*]\s+(.*?)$/gm, '<li>$1</li>');
        
        // Wrap consecutive <li> elements in <ul>
        // Match a block of <li> lines and wrap them. Since we replaced lines with <li>, they might be separated by newlines.
        html = html.replace(/((?:<li>.*?<\/li>\s*)+)/g, '<ul>$1</ul>');

        // 5. Paragraphs: split by blank lines and wrap non-tag contents in <p>
        const blocks = html.split(/\n\s*\n/);
        const parsedBlocks = blocks.map(block => {
            const trimmed = block.trim();
            if (!trimmed) return '';
            
            // If it already starts with a block tag (h1, h2, h3, ul), return it
            if (/^<(h1|h2|h3|ul|li)/i.test(trimmed)) {
                return trimmed;
            }
            // Otherwise, wrap in paragraph
            return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
        });

        return parsedBlocks.join('\n');
    },

    handleSaveVersion() {
        const editor = document.getElementById('resume-markdown-editor');
        const commitMsgInput = document.getElementById('resume-commit-message');
        
        const content = editor.value.trim();
        const commitMessage = commitMsgInput.value.trim();

        if (!content) {
            alert('Resume content cannot be empty!');
            return;
        }

        // Add version
        const newResume = window.StorageManager.addResume(content, commitMessage);
        
        // Reload resumes
        const resumes = window.StorageManager.getResumes();
        this.populateVersionSelects(resumes);
        
        // Set active in main select
        document.getElementById('resume-version-select').value = newResume.id;
        this.loadResumeVersion(newResume);
        
        // Update tracker form selects if tracker is initialized
        if (window.TrackerController) {
            window.TrackerController.populateResumeDropdowns(resumes);
            window.TrackerController.populateResumeFilter(resumes);
        }

        alert(`Successfully saved version ${newResume.version}!`);
    },

    handleDownloadPDF() {
        const editor = document.getElementById('resume-markdown-editor');
        const printContent = document.getElementById('resume-print-content');
        
        if (!printContent || !editor) return;

        // Populate print isolation container with styled rendered markdown
        printContent.innerHTML = `
            <div class="resume-preview">
                ${this.parseMarkdown(editor.value)}
            </div>
        `;

        // Execute print command
        window.print();
    },

    // Revision Diff Viewer (LCS algorithm)
    openDiffModal() {
        const resumes = window.StorageManager.getResumes();
        if (resumes.length < 2) {
            alert('You need at least 2 saved versions to compare changes!');
            return;
        }

        const overlay = document.getElementById('diff-modal-overlay');
        overlay.classList.add('active');

        // Set defaults: Ver B = current selection, Ver A = previous version in list
        const activeVer = document.getElementById('resume-version-select').value;
        const activeIndex = resumes.findIndex(r => r.id === activeVer);
        
        const verBSelect = document.getElementById('diff-ver-b');
        const verASelect = document.getElementById('diff-ver-a');
        
        verBSelect.value = activeVer;
        
        if (activeIndex > 0) {
            verASelect.value = resumes[activeIndex - 1].id;
        } else {
            verASelect.value = resumes[resumes.length - 1].id;
        }

        this.renderDiffView();
    },

    closeDiffModal() {
        document.getElementById('diff-modal-overlay').classList.remove('active');
    },

    renderDiffView() {
        const verAId = document.getElementById('diff-ver-a').value;
        const verBId = document.getElementById('diff-ver-b').value;
        const container = document.getElementById('diff-container');

        if (!container) return;

        const resumes = window.StorageManager.getResumes();
        const resA = resumes.find(r => r.id === verAId);
        const resB = resumes.find(r => r.id === verBId);

        if (!resA || !resB) {
            container.innerHTML = 'Error loading versions for diff comparison.';
            return;
        }

        const linesA = resA.content.split('\n');
        const linesB = resB.content.split('\n');

        const diffs = this.diffLines(linesA, linesB);

        container.innerHTML = '';
        
        diffs.forEach(item => {
            const lineEl = document.createElement('div');
            lineEl.className = `diff-line diff-line-${item.type}`;
            
            const numVal = item.type === 'removed' ? item.lineNumA : (item.type === 'added' ? item.lineNumB : item.lineNumB);
            
            lineEl.innerHTML = `
                <span class="diff-line-num">${numVal}</span>
                <span class="diff-line-content">${this.escapeHtml(item.line)}</span>
            `;
            container.appendChild(lineEl);
        });
    },

    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },

    // Longest Common Subsequence line comparison
    diffLines(linesA, linesB) {
        const n = linesA.length;
        const m = linesB.length;
        
        // DP Table
        const dp = Array(n + 1).fill(null).map(() => Array(m + 1).fill(0));
        
        for (let i = 1; i <= n; i++) {
            for (let j = 1; j <= m; j++) {
                if (linesA[i - 1] === linesB[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }

        let i = n;
        let j = m;
        const diff = [];

        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
                diff.unshift({
                    type: 'unchanged',
                    line: linesA[i - 1],
                    lineNumA: i,
                    lineNumB: j
                });
                i--;
                j--;
            } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
                diff.unshift({
                    type: 'added',
                    line: linesB[j - 1],
                    lineNumB: j
                });
                j--;
            } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
                diff.unshift({
                    type: 'removed',
                    line: linesA[i - 1],
                    lineNumA: i
                });
                i--;
            }
        }

        return diff;
    }
};

window.ResumeController = ResumeController;
