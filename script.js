const typingText = document.getElementById('typingText');
const phrases = [
  'EasyCode, a collaborative low-code platform',
  'AIConnect recruitment and CV workflows',
  'responsive Angular and PHP experiences',
  'hybrid mobile apps with Ionic and Cordova',
  'gameplay systems in Unity and C#'
];

let phraseIndex = 0;
let characterIndex = 0;
let deleting = false;

function typeLoop() {
  const currentPhrase = phrases[phraseIndex];

  if (!deleting) {
    characterIndex += 1;
    typingText.textContent = currentPhrase.slice(0, characterIndex);

    if (characterIndex === currentPhrase.length) {
      deleting = true;
      setTimeout(typeLoop, 1400);
      return;
    }
  } else {
    characterIndex -= 1;
    typingText.textContent = currentPhrase.slice(0, characterIndex);

    if (characterIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }

  setTimeout(typeLoop, deleting ? 35 : 70);
}

typeLoop();

const revealElements = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealElements.forEach(element => observer.observe(element));

const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');

function closeMenu() {
  navToggle.classList.remove('active');
  siteNav.classList.remove('open');
  document.body.classList.remove('menu-open');
  navToggle.setAttribute('aria-expanded', 'false');
}

navToggle.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  navToggle.classList.toggle('active', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach(link => link.addEventListener('click', closeMenu));

const codeProjects = window.codeShowcaseProjects || [];
const codeProjectList = document.getElementById('codeProjectList');
const codeFeatureTabs = document.getElementById('codeFeatureTabs');
const codeSearch = document.getElementById('codeSearch');
const codeEmpty = document.getElementById('codeEmpty');
const activeProjectName = document.getElementById('activeProjectName');
const activeProjectType = document.getElementById('activeProjectType');
const activeProjectDescription = document.getElementById('activeProjectDescription');
const activeProjectStack = document.getElementById('activeProjectStack');
const activeCodePath = document.getElementById('activeCodePath');
const activeCodeLanguage = document.getElementById('activeCodeLanguage');
const activeCodeDescription = document.getElementById('activeCodeDescription');
const activeCodeContext = document.getElementById('activeCodeContext');
const activeCode = document.getElementById('activeCode');
const copyCodeButton = document.getElementById('copyCode');
let visibleCodeProjects = [...codeProjects];
let activeCodeProjectId = codeProjects[0]?.id;
let activeCodeSampleIndex = 0;

function renderActiveCodeSample() {
  const project = codeProjects.find(item => item.id === activeCodeProjectId);
  const sample = project?.samples[activeCodeSampleIndex];
  if (!project || !sample) return;

  activeProjectName.textContent = project.name;
  activeProjectType.textContent = project.type;
  activeProjectDescription.textContent = project.description;
  activeProjectStack.innerHTML = project.stack.map(item => `<span>${item}</span>`).join('');

  activeCodePath.textContent = sample.path;
  activeCodeLanguage.textContent = `${sample.language} · ${sample.title}`;
  activeCodeDescription.textContent = sample.description;
  activeCodeContext.textContent = sample.context;
  activeCode.textContent = sample.code.trim();
  copyCodeButton.textContent = 'Copy code';

  document.querySelectorAll('.code-project-button').forEach(button => {
    const selected = button.dataset.projectId === project.id;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });

  codeFeatureTabs.innerHTML = project.samples.map((item, index) => `
    <button class="code-feature-tab ${index === activeCodeSampleIndex ? 'active' : ''}"
      type="button" role="tab" aria-selected="${index === activeCodeSampleIndex}"
      data-sample-index="${index}">
      <span>${String(index + 1).padStart(2, '0')}</span>${item.title}
    </button>
  `).join('');

  codeFeatureTabs.querySelectorAll('.code-feature-tab').forEach((button, index, buttons) => {
    button.tabIndex = index === activeCodeSampleIndex ? 0 : -1;
    button.addEventListener('click', () => {
      activeCodeSampleIndex = Number(button.dataset.sampleIndex);
      renderActiveCodeSample();
    });
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const next = (index + direction + buttons.length) % buttons.length;
      activeCodeSampleIndex = next;
      renderActiveCodeSample();
      codeFeatureTabs.querySelectorAll('.code-feature-tab')[next].focus();
    });
  });
}

function renderCodeProjects() {
  codeProjectList.innerHTML = visibleCodeProjects.map((project, index) => `
    <button class="code-project-button ${project.id === activeCodeProjectId ? 'active' : ''}"
      type="button" role="tab" aria-selected="${project.id === activeCodeProjectId}"
      data-project-id="${project.id}">
      <span class="code-project-number">${String(index + 1).padStart(2, '0')}</span>
      <span><strong>${project.name}</strong><small>${project.type}</small></span>
      <em>${project.samples.length}</em>
    </button>
  `).join('');

  codeEmpty.hidden = visibleCodeProjects.length > 0;

  codeProjectList.querySelectorAll('.code-project-button').forEach((button, index, buttons) => {
    button.tabIndex = button.dataset.projectId === activeCodeProjectId ? 0 : -1;
    button.addEventListener('click', () => {
      activeCodeProjectId = button.dataset.projectId;
      activeCodeSampleIndex = 0;
      renderCodeProjects();
      renderActiveCodeSample();
    });
    button.addEventListener('keydown', event => {
      if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const next = (index + direction + buttons.length) % buttons.length;
      buttons[next].focus();
    });
  });
}

function filterCodeProjects(query) {
  const term = query.trim().toLowerCase();
  visibleCodeProjects = codeProjects.filter(project => {
    const searchable = [
      project.name,
      project.type,
      project.description,
      ...project.stack,
      ...project.samples.flatMap(sample => [sample.title, sample.language, sample.path, sample.description])
    ].join(' ').toLowerCase();
    return searchable.includes(term);
  });

  if (visibleCodeProjects.length && !visibleCodeProjects.some(item => item.id === activeCodeProjectId)) {
    activeCodeProjectId = visibleCodeProjects[0].id;
    activeCodeSampleIndex = 0;
    renderActiveCodeSample();
  }
  renderCodeProjects();
}

codeSearch?.addEventListener('input', event => filterCodeProjects(event.target.value));
document.addEventListener('keydown', event => {
  if (event.key === '/' && document.activeElement !== codeSearch) {
    event.preventDefault();
    codeSearch?.focus();
  }
});

document.getElementById('codeProjectCount').textContent = codeProjects.length;
document.getElementById('codeSampleCount').textContent = codeProjects.reduce(
  (total, project) => total + project.samples.length,
  0
);
renderCodeProjects();
renderActiveCodeSample();

async function copyActiveCode() {
  if (!activeCode) return;
  const code = activeCode.textContent;

  try {
    await navigator.clipboard.writeText(code);
  } catch {
    const textArea = document.createElement('textarea');
    textArea.value = code;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    textArea.remove();
  }

  copyCodeButton.textContent = 'Copied ✓';
  window.setTimeout(() => {
    copyCodeButton.textContent = 'Copy code';
  }, 1600);
}

copyCodeButton?.addEventListener('click', copyActiveCode);

const backToTop = document.getElementById('backToTop');
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const cursorGlow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', event => {
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

const canvas = document.getElementById('matrixCanvas');
const context = canvas.getContext('2d');
const characters = '01{}[]<>/\\$#@*+-=JSAPICSSHTMLPHP';
let fontSize = 14;
let columns = 0;
let drops = [];

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * pixelRatio;
  canvas.height = window.innerHeight * pixelRatio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  columns = Math.floor(window.innerWidth / fontSize);
  drops = Array.from({ length: columns }, () => Math.random() * -50);
}

function drawMatrix() {
  context.fillStyle = 'rgba(7, 8, 13, 0.09)';
  context.fillRect(0, 0, window.innerWidth, window.innerHeight);
  context.fillStyle = '#71f79f';
  context.font = `${fontSize}px Fira Code, monospace`;

  for (let index = 0; index < drops.length; index += 1) {
    const character = characters[Math.floor(Math.random() * characters.length)];
    const x = index * fontSize;
    const y = drops[index] * fontSize;
    context.fillText(character, x, y);

    if (y > window.innerHeight && Math.random() > 0.975) {
      drops[index] = 0;
    }

    drops[index] += 0.45;
  }

  requestAnimationFrame(drawMatrix);
}

resizeCanvas();
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  drawMatrix();
}
window.addEventListener('resize', resizeCanvas);

document.querySelectorAll('.unity-card video').forEach(video => {
  const source = video.querySelector('source');
  if (!source) return;

  source.addEventListener('error', () => {
    video.hidden = true;
    const placeholder = document.createElement('div');
    placeholder.className = 'video-empty';
    placeholder.innerHTML = '<span>VIDEO PATH READY</span><strong>Add the matching MP4 file to preview this project.</strong>';
    video.before(placeholder);
  });
});

const sections = document.querySelectorAll('main section[id]');
const navigationAnchors = document.querySelectorAll('.site-nav a[href^="#"]');

window.addEventListener('scroll', () => {
  let currentSection = '';

  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 180) {
      currentSection = section.id;
    }
  });

  navigationAnchors.forEach(anchor => {
    anchor.classList.toggle('active', anchor.getAttribute('href') === `#${currentSection}`);
  });
});
