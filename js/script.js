// NASA APOD API endpoint and your API key
const NASA_API_KEY = 'DEMO_KEY'; // Replace with your own API key for production
const NASA_APOD_URL = 'https://api.nasa.gov/planetary/apod';

// Array of fun space facts
const spaceFacts = [
	"Venus spins backwards compared to most planets.",
	"A day on Mercury is longer than its year!",
	"Neutron stars can spin 600 times per second.",
	"Jupiter has the shortest day of all the planets.",
	"The footprints on the Moon will be there for millions of years.",
	"There are more trees on Earth than stars in the Milky Way.",
	"A spoonful of a neutron star weighs about a billion tons.",
	"Saturn could float in water because it’s mostly gas.",
	"The Sun makes up 99.8% of our solar system’s mass.",
	"Space is completely silent—there’s no air for sound to travel."
];

// Show a random space fact
function showRandomFact() {
	const factSection = document.createElement('section');
	factSection.className = 'space-fact';
	const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
	factSection.innerHTML = `<strong>Did You Know?</strong> ${randomFact}`;
	const container = document.querySelector('.container');
	container.insertBefore(factSection, container.children[1]);
}

// Show loading message
function showLoading() {
	const gallery = document.getElementById('gallery');
	gallery.innerHTML = `<div class="loading-msg">🔄 Loading space photos…</div>`;
}

// Create gallery items
function createGallery(items) {
	const gallery = document.getElementById('gallery');
	gallery.innerHTML = '';
	items.forEach((item, idx) => {
		const card = document.createElement('div');
		card.className = 'gallery-item';
		card.tabIndex = 0;
		card.setAttribute('data-idx', idx);

		// Handle image or video
		if (item.media_type === 'image') {
			card.innerHTML = `
				<img src="${item.url}" alt="${item.title}" class="gallery-img" />
				<div class="gallery-info">
					<h2>${item.title}</h2>
					<p>${item.date}</p>
				</div>
			`;
		} else if (item.media_type === 'video') {
			// Show video thumbnail if available, else a link
			let videoThumb = item.thumbnail_url || 'img/video-placeholder.png';
			card.innerHTML = `
				<div class="video-thumb-wrapper">
					<img src="${videoThumb}" alt="Video: ${item.title}" class="gallery-img" />
					<span class="video-badge">▶</span>
				</div>
				<div class="gallery-info">
					<h2>${item.title}</h2>
					<p>${item.date}</p>
				</div>
			`;
		}
		// Add click event to open modal
		card.addEventListener('click', () => openModal(item));
		card.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') openModal(item);
		});
		gallery.appendChild(card);
	});
}

// Modal logic
function openModal(item) {
	// Create modal overlay
	let modal = document.createElement('div');
	modal.className = 'modal-overlay';
	modal.tabIndex = 0;
	// Modal content
	let content = document.createElement('div');
	content.className = 'modal-content';
	// Fill modal based on media type
	if (item.media_type === 'image') {
		content.innerHTML = `
			<img src="${item.hdurl || item.url}" alt="${item.title}" class="modal-img" />
			<h2>${item.title}</h2>
			<p class="modal-date">${item.date}</p>
			<p class="modal-explanation">${item.explanation}</p>
			<button class="modal-close">Close</button>
		`;
	} else if (item.media_type === 'video') {
		content.innerHTML = `
			<div class="modal-video-wrapper">
				<iframe src="${item.url}" frameborder="0" allowfullscreen class="modal-video"></iframe>
			</div>
			<h2>${item.title}</h2>
			<p class="modal-date">${item.date}</p>
			<p class="modal-explanation">${item.explanation}</p>
			<a href="${item.url}" target="_blank" class="modal-link">Watch on YouTube</a>
			<button class="modal-close">Close</button>
		`;
	}
	modal.appendChild(content);
	document.body.appendChild(modal);
	// Focus for accessibility
	modal.focus();
	// Close modal on button click or overlay click
	content.querySelector('.modal-close').onclick = closeModal;
	modal.onclick = function(e) {
		if (e.target === modal) closeModal();
	};
	// Close on Escape key
	document.addEventListener('keydown', escClose);
	function escClose(e) {
		if (e.key === 'Escape') closeModal();
	}
	function closeModal() {
		modal.remove();
		document.removeEventListener('keydown', escClose);
	}
}


// Fetch APOD data for 9 consecutive days from a selected start date
function fetchImages() {
	showLoading();
	// Ask user for a start date
	let start = prompt('Enter start date (YYYY-MM-DD):', '2022-01-01');
	if (!start) {
		document.getElementById('gallery').innerHTML = '<div class="placeholder"><p>No date selected.</p></div>';
		return;
	}
	// Calculate end date (8 days after start)
	let startDate = new Date(start);
	if (isNaN(startDate.getTime())) {
		document.getElementById('gallery').innerHTML = '<div class="placeholder"><p>Invalid date format.</p></div>';
		return;
	}
	let endDate = new Date(startDate);
	endDate.setDate(startDate.getDate() + 8);
	// Format dates as YYYY-MM-DD
	function formatDate(d) {
		return d.toISOString().slice(0, 10);
	}
	let startStr = formatDate(startDate);
	let endStr = formatDate(endDate);

	// Build API URL
	const url = `${NASA_APOD_URL}?api_key=${NASA_API_KEY}&start_date=${startStr}&end_date=${endStr}`;

	fetch(url)
		.then(res => res.json())
		.then(data => {
			if (!Array.isArray(data)) {
				document.getElementById('gallery').innerHTML = '<div class="placeholder"><p>Failed to load images. Try again later.</p></div>';
				return;
			}
			if (data.length === 0) {
				document.getElementById('gallery').innerHTML = '<div class="placeholder"><p>No images found for this range.</p></div>';
				return;
			}
			createGallery(data);
		})
		.catch(() => {
			document.getElementById('gallery').innerHTML = '<div class="placeholder"><p>Failed to load images. Try again later.</p></div>';
		});
}

// Add event listener to button
document.getElementById('getImageBtn').addEventListener('click', fetchImages);

// Show random fact on load
showRandomFact();