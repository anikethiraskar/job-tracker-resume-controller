const DashboardController = {
    init() {
        this.updateDashboard();
    },

    updateDashboard() {
        const jobs = window.StorageManager.getJobs();
        this.calculateStats(jobs);
        this.renderStatusChart(jobs);
        this.renderTimelineChart(jobs);
    },

    calculateStats(jobs) {
        const total = jobs.length;
        const interviewing = jobs.filter(j => j.status === 'Interviewing').length;
        const offers = jobs.filter(j => j.status === 'Offer').length;
        
        // Interview Rate: jobs in Interviewing, Offer, or Rejected with interview notes
        const interviewedJobs = jobs.filter(j => 
            ['Interviewing', 'Offer'].includes(j.status) || 
            (j.status === 'Rejected' && /interview|assessment|loop|screening/i.test(j.notes || ''))
        ).length;

        const ratio = total > 0 ? Math.round((interviewedJobs / total) * 100) : 0;

        // Update elements in DOM
        document.getElementById('stat-total').textContent = total;
        document.getElementById('stat-interviews').textContent = interviewing;
        document.getElementById('stat-offers').textContent = offers;
        document.getElementById('stat-ratio').textContent = `${ratio}%`;
    },

    renderStatusChart(jobs) {
        const container = document.getElementById('status-chart-container');
        const legend = document.getElementById('status-chart-legend');
        if (!container || !legend) return;

        // Status configs
        const statusConfig = {
            'Wishlist': { color: 'var(--color-wishlist)', label: 'Wishlist' },
            'Applied': { color: 'var(--color-applied)', label: 'Applied' },
            'Interviewing': { color: 'var(--color-interviewing)', label: 'Interviewing' },
            'Offer': { color: 'var(--color-offer)', label: 'Offer' },
            'Rejected': { color: 'var(--color-rejected)', label: 'Rejected' }
        };

        // Group counts
        const counts = { Wishlist: 0, Applied: 0, Interviewing: 0, Offer: 0, Rejected: 0 };
        jobs.forEach(j => {
            if (counts[j.status] !== undefined) {
                counts[j.status]++;
            }
        });

        const total = jobs.length;
        container.innerHTML = '';
        legend.innerHTML = '';

        if (total === 0) {
            container.innerHTML = `<div style="color: var(--text-secondary)">No application data. Add jobs to see charts!</div>`;
            return;
        }

        // Build SVG Donut Chart
        const svgSize = 200;
        const radius = 65;
        const strokeWidth = 16;
        const cx = svgSize / 2;
        const cy = svgSize / 2;
        const circumference = 2 * Math.PI * radius;

        let svgHtml = `<svg viewBox="0 0 ${svgSize} ${svgSize}" style="width: 100%; height: 100%;">`;
        
        let currentOffset = 0;

        Object.keys(counts).forEach(status => {
            const count = counts[status];
            const percent = count / total;
            const strokeLength = percent * circumference;
            const strokeOffset = circumference - currentOffset;

            if (count > 0) {
                svgHtml += `
                    <circle 
                        cx="${cx}" 
                        cy="${cy}" 
                        r="${radius}" 
                        fill="transparent" 
                        stroke="${statusConfig[status].color}" 
                        stroke-width="${strokeWidth}" 
                        stroke-dasharray="${strokeLength} ${circumference}" 
                        stroke-dashoffset="${strokeOffset}" 
                        transform="rotate(-90 ${cx} ${cy})"
                        style="transition: stroke-dashoffset 0.5s ease; cursor: pointer;"
                        title="${status}: ${count} (${Math.round(percent * 100)}%)"
                    />
                `;
                currentOffset += strokeLength;
            }

            // Render Legend Item
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                <div class="legend-color" style="background: ${statusConfig[status].color}"></div>
                <span>${statusConfig[status].label} (${count})</span>
            `;
            legend.appendChild(legendItem);
        });

        svgHtml += `</svg>`;
        
        // Add Donut Center Total Text
        const centerText = document.createElement('div');
        centerText.className = 'donut-center-text';
        centerText.innerHTML = `
            <span class="donut-total">${total}</span>
            <span class="donut-label">Total</span>
        `;

        container.style.position = 'relative';
        container.innerHTML = svgHtml;
        container.appendChild(centerText);
    },

    renderTimelineChart(jobs) {
        const container = document.getElementById('timeline-chart-container');
        if (!container) return;

        container.innerHTML = '';
        const total = jobs.length;

        if (total === 0) {
            container.innerHTML = `<div style="color: var(--text-secondary)">No application data. Add jobs to see charts!</div>`;
            return;
        }

        // Calculate jobs per week for the last 5 weeks
        const weeks = [];
        const today = new Date();
        
        // Initialize 5 weeks back
        for (let i = 4; i >= 0; i--) {
            const start = new Date(today);
            start.setDate(today.getDate() - (i + 1) * 7);
            const end = new Date(today);
            end.setDate(today.getDate() - i * 7);
            
            let label = '';
            if (i === 0) label = 'This Wk';
            else if (i === 1) label = 'Last Wk';
            else label = `${i} Wks Ago`;

            weeks.push({
                start: start,
                end: end,
                label: label,
                count: 0
            });
        }

        // Count jobs in each week block
        jobs.forEach(job => {
            const date = new Date(job.dateApplied);
            weeks.forEach(w => {
                if (date >= w.start && date < w.end) {
                    w.count++;
                }
            });
        });

        const maxCount = Math.max(...weeks.map(w => w.count), 4); // Min ceiling of 4 for better proportions

        // Render SVG Bar Chart
        const width = 450;
        const height = 220;
        const padding = { top: 20, right: 20, bottom: 40, left: 30 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        let svgHtml = `<svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%;">`;

        // Horizontal Gridlines
        const gridLinesCount = 4;
        for (let i = 0; i <= gridLinesCount; i++) {
            const y = padding.top + (chartHeight / gridLinesCount) * i;
            const labelVal = Math.round(maxCount - (maxCount / gridLinesCount) * i);
            svgHtml += `
                <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
                <text x="${padding.left - 8}" y="${y + 4}" fill="var(--text-muted)" font-size="10" text-anchor="end">${labelVal}</text>
            `;
        }

        // Draw Bars
        const barSpacing = 20;
        const barWidth = (chartWidth - (barSpacing * (weeks.length - 1))) / weeks.length;

        weeks.forEach((w, index) => {
            const x = padding.left + index * (barWidth + barSpacing);
            const barHeight = (w.count / maxCount) * chartHeight;
            const y = height - padding.bottom - barHeight;

            svgHtml += `
                <!-- Background shadow bar -->
                <rect 
                    x="${x}" 
                    y="${padding.top}" 
                    width="${barWidth}" 
                    height="${chartHeight}" 
                    fill="rgba(255, 255, 255, 0.01)" 
                    rx="4" 
                />
                <!-- Filled data bar -->
                <rect 
                    x="${x}" 
                    y="${y}" 
                    width="${barWidth}" 
                    height="${Math.max(barHeight, 4)}" 
                    fill="url(#accentGrad)" 
                    rx="6"
                    style="transition: height 0.5s ease, y 0.5s ease; cursor: pointer;"
                    title="${w.label}: ${w.count} applied"
                />
                <!-- Label text -->
                <text 
                    x="${x + barWidth / 2}" 
                    y="${height - padding.bottom + 18}" 
                    fill="var(--text-secondary)" 
                    font-size="10" 
                    text-anchor="middle"
                    font-weight="500"
                >
                    ${w.label}
                </text>
            `;
        });

        // SVG Gradient definition
        svgHtml += `
            <defs>
                <linearGradient id="accentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#6366f1" />
                    <stop offset="100%" stop-color="#06b6d4" />
                </linearGradient>
            </defs>
        `;

        svgHtml += `</svg>`;
        container.innerHTML = svgHtml;
    }
};

window.DashboardController = DashboardController;
