document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize data layer
    window.StorageManager.init();

    // 2. Initialize feature controllers
    window.DashboardController.init();
    window.TrackerController.init();
    window.ResumeController.init();

    // 3. Setup Navigation & Routing
    initNavigation();
});

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-panel');
    const headerHeading = document.getElementById('header-heading');
    const globalAddBtn = document.getElementById('global-add-job-btn');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const target = item.dataset.target;
            if (!target) return;

            // Update active navigation item link
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Swap visible content sections
            sections.forEach(sec => {
                if (sec.id === `panel-${target}`) {
                    sec.classList.add('active');
                } else {
                    sec.classList.remove('active');
                }
            });

            // Update header contents and buttons based on active tab
            switch (target) {
                case 'dashboard':
                    headerHeading.textContent = 'Dashboard Analytics';
                    globalAddBtn.style.display = 'inline-flex';
                    // Re-render dashboard charts to make sure SVG matches new container dimensions
                    if (window.DashboardController) {
                        window.DashboardController.updateDashboard();
                    }
                    break;
                case 'tracker':
                    headerHeading.textContent = 'Job Application Tracker';
                    globalAddBtn.style.display = 'inline-flex';
                    // Re-render kanban board to reflect any changes
                    if (window.TrackerController) {
                        window.TrackerController.filterAndRender();
                    }
                    break;
                case 'resume':
                    headerHeading.textContent = 'Resume Version Controller';
                    globalAddBtn.style.display = 'none'; // Hide global add btn on editor tab
                    break;
            }
        });
    });

    // Link header global add button to Tracker Form
    if (globalAddBtn) {
        globalAddBtn.addEventListener('click', () => {
            if (window.TrackerController) {
                window.TrackerController.openJobDrawer();
            }
        });
    }
}
