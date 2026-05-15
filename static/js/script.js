let isMobile = getIsMobile();

// if (isMobile) {
// 	initSlider(document.querySelector('.stages .slider'));
// }

initSlider(document.querySelector('.stages .slider'));
initSlider(document.querySelector('.participants .slider'), { autoplay: true });

function initSlider(slider, options = {}) {
	if (!slider) return console.warn('Slider container not found');

	const { autoplay = false, autoplayDelay = 4000 } = options;

	const sliderContent = slider.querySelector('.slider_content');
	const btnLeft = slider.querySelector('.slider_btn-left');
	const btnRight = slider.querySelector('.slider_btn-right');
	const progressCurrent = slider.querySelector('.slider_progress_current');
	const progressTotal = slider.querySelector('.slider_progress_total');
	const sliderDots = slider.querySelector('.slider_dots');

	if (!sliderContent) return console.warn('.slider_content not found');

	const slides = Array.from(sliderContent.children).filter(el => !el.dataset.slideComponent);
	const totalSlides = slides.length;
	if (totalSlides === 0) return;

	const visibleWidth = slider.clientWidth;
	const sliderItemWidth = slides[0].clientWidth;
	const visibleSlidesCount = Math.max(1, Math.floor(visibleWidth / sliderItemWidth));
	const pages = Math.ceil(totalSlides / visibleSlidesCount);
	const maxPage = Math.max(0, pages - 1);

	const columnGap = parseInt(window.getComputedStyle(sliderContent).columnGap) || 0;
	const shiftPercent = 100 + (columnGap * 100 / visibleWidth);

	let currentPage = 0;
	let autoplayInterval = null;

	if (sliderDots) initSliderDots();
	updateSlider();
	if (autoplay) startAutoplay();

	if (btnLeft) btnLeft.addEventListener('click', () => navigate(-1));
	if (btnRight) btnRight.addEventListener('click', () => navigate(1));

	function navigate(direction) {
		currentPage = Math.max(0, Math.min(maxPage, currentPage + direction));
		updateSlider();
		if (autoplay) resetAutoplay();
	}

	function updateSlider() {
		sliderContent.style.transform = `translateX(-${currentPage * shiftPercent}%)`;

		if (progressCurrent) {
			progressCurrent.textContent = Math.min((currentPage + 1) * visibleSlidesCount, totalSlides);
		}
		if (progressTotal) {
			progressTotal.textContent = `/ ${totalSlides}`;
		}

		if (sliderDots) {
			const prevActive = sliderDots.querySelector('.slider_dot.active');
			if (prevActive) prevActive.classList.remove('active');
			
			const nextActive = sliderDots.querySelector(`.slider_dot[data-slide-idx="${currentPage}"]`);
			if (nextActive) nextActive.classList.add('active');
		}

		if (btnLeft) btnLeft.toggleAttribute('disabled', currentPage === 0);
		if (btnRight) btnRight.toggleAttribute('disabled', currentPage === maxPage);
	}

	function startAutoplay() {
		clearInterval(autoplayInterval);
		autoplayInterval = setInterval(() => {
			currentPage = currentPage >= maxPage ? 0 : currentPage + 1;
			updateSlider();
		}, autoplayDelay);
	}

	function resetAutoplay() {
		clearInterval(autoplayInterval);
		startAutoplay();
	}

	function initSliderDots() {
		sliderDots.innerHTML = Array.from({ length: pages }, (_, i) => 
			`<button class="slider_dot" data-slide-idx="${i}" aria-label="Перейти к слайду ${i + 1}"></button>`
		).join('');

		sliderDots.addEventListener('click', e => {
			const dot = e.target.closest('.slider_dot');
			if (!dot) return;
			currentPage = parseInt(dot.dataset.slideIdx, 10);
			updateSlider();
			if (autoplay) resetAutoplay();
		});
	}
}

function getIsMobile() {
	return window.innerWidth < 769;
}



const animationObserver = new IntersectionObserver((entries) => {
	entries.forEach((entry, i) => {
		if (entry.isIntersecting) {
			animationObserver.unobserve(entry.target);
			entry.target.classList.add('a');
		}
	});
}, {threshold: .2});

document.querySelectorAll('.info_header, .info_content_img, .info_content_main, .stages').forEach(item => {
	animationObserver.observe(item);
});

if (!isMobile) {
	document.querySelectorAll('.stage').forEach(item => {
		animationObserver.observe(item);
	});
}