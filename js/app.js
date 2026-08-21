/**
 * Campus Flow - Main Application Controller
 * File: js/app.js
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  registerServiceWorker();
});

/**
 * Handles tab navigation and section visibility
 */
function initNavigation() {
  const navLinks = document.querySelectorAll('.main-nav .nav-link');
  
  // Define mapping between nav href hash and DOM section IDs
  const sections = {
    '#dashboard': document.querySelector('.metrics-grid')?.parentElement,
    '#roster': document.getElementById('roster'),
    '#archives': document.getElementById('archives'),
    '#scanner': document.getElementById('scanner')
  };

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetHash = link.getAttribute('href');
      
      // Allow standard link behavior if target isn't a hash route
      if (!targetHash.startsWith('#')) return;
      
      e.preventDefault();

      // Update active class on nav links
      navLinks.forEach(nav => nav.classList.remove('active'));
      link.classList.add('active');

      // Update section visibility
      switchTab(targetHash);
    });
  });

  // Handle direct deep linking on initial page load (e.g., campus-flow/#archives)
  const initialHash = window.location.hash || '#dashboard';
  const initialLink = document.querySelector(`.main-nav .nav-link[href="${initialHash}"]`);
  if (initialLink) {
    initialLink.click();
  }
}

/**
 * Toggles section display based on selected target tab
 * @param {string} targetHash 
 */
function switchTab(targetHash) {
  const rosterSection = document.getElementById('roster');
  const archivesSection = document.getElementById('archives');
  const metricsSection = document.querySelector('.metrics-grid');
  const quickActionsSection = document.querySelector('.quick-actions');
  const scannerSection = document.getElementById('scanner');

  // Hide all optional sections by default
  if (rosterSection) rosterSection.style.display = 'none';
  if (archivesSection) archivesSection.style.display = 'none';
  if (scannerSection) scannerSection.style.display = 'none';

  // Toggle view based on route
  switch (targetHash) {
    case '#roster':
      if (rosterSection) rosterSection.style.display = 'block';
      if (metricsSection) metricsSection.style.display = 'none';
      if (quickActionsSection) quickActionsSection.style.display = 'none';
      break;

    case '#archives':
      if (archivesSection) archivesSection.style.display = 'block';
      if (metricsSection) metricsSection.style.display = 'none';
      if (quickActionsSection) quickActionsSection.style.display = 'none';
      // Refresh archives list when switching to tab
      if (typeof renderArchiveRoster === 'function') {
        renderArchiveRoster();
      }
      break;

    case '#scanner':
      if (scannerSection) scannerSection.style.display = 'block';
      if (metricsSection) metricsSection.style.display = 'none';
      if (quickActionsSection) quickActionsSection.style.display = 'none';
      break;

    case '#dashboard':
    default:
      if (metricsSection) metricsSection.style.display = 'grid';
      if (quickActionsSection) quickActionsSection.style.display = 'block';
      if (rosterSection) rosterSection.style.display = 'block';
      break;
  }
}

/**
 * Registers the service worker for PWA offline capability
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
          console.log('Campus Flow ServiceWorker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('ServiceWorker registration failed:', error);
        });
    });
  }
}
