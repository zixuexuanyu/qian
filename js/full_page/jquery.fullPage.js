/**
 * fullPage 2.2.1
 * https://github.com/alvarotrigo/fullPage.js
 * MIT licensed
 *
 * Copyright (C) 2013 alvarotrigo.com - A project by Alvaro Trigo
 */

(function($) {
	$.fn.fullpage = function(options) {
		// ����һЩĬ��ֵ�����޸����ǵ�ѡ��
		options = $.extend({
			"verticalCentered": true,
			'resize': true,
			'sectionsColor': [],
			'anchors': [],
			'scrollingSpeed': 700,
			'easing': 'easeInQuart',
			'menu': false,
			'navigation': false,
			'navigationPosition': 'right',
			'navigationColor': '#000',
			'navigationTooltips': [],
			'slidesNavigation': false,
			'slidesNavPosition': 'bottom',
			'controlArrowColor': '#fff',
			'loopBottom': false,
			'loopTop': false,
			'loopHorizontal': true,
			'autoScrolling': true,
			'scrollOverflow': false,
			'css3': false,
			'paddingTop': 0,
			'paddingBottom': 0,
			'fixedElements': null,
			'normalScrollElements': null,
			'keyboardScrolling': true,
			'touchSensitivity': 5,
			'continuousVertical': false,
			'animateAnchor': true,
			'normalScrollElementTouchThreshold': 5,
			'sectionSelector': '.section',
			'slideSelector': '.slide',

			//�¼�
			'afterLoad': null,
			'onLeave': null,
			'afterRender': null,
			'afterResize': null,
			'afterSlideLoad': null,
			'onSlideLeave': null
		}, options);

		// ���û��������
		if (options.continuousVertical &&
			(options.loopTop || options.loopBottom)) {
			options.continuousVertical = false;
			console && console.log && console.log("Option loopTop/loopBottom is mutually exclusive with continuousVertical; continuousVertical disabled");
		}

		// �������ӳ����ܹ���������һ��֮ǰ��ȡ�ĵط�
		// С�ģ����Ƽ�ȥ�ı����� 400 �ڱʼǱ������е�������Ϊ��
		// ƻ���豸 ���ʼǱ����ԡ� ����......)
		var scrollDelay = 600;

		//����ҳ�������ʽ������Ϊ true ʱ�Զ�����
		$.fn.fullpage.setAutoScrolling = function(value) {
			options.autoScrolling = value;

			var element = $('.fp-section.active');

			if (options.autoScrolling) {
				$('html, body').css({
					'overflow': 'hidden',
					'height': '100%'
				});

				if (element.length) {
					//�����ƶ�����
					silentScroll(element.position().top);
				}

			} else {
				$('html, body').css({
					'overflow': 'auto',
					'height': 'auto'
				});

				silentScroll(0);

				//�������Ĳ�����û�ж���ҳ
				$('html, body').scrollTop(element.position().top);
			}

		};

		/**
		 * �����Ժ���Ϊ��λ�Ĺ����ٶ�
		 */
		$.fn.fullpage.setScrollingSpeed = function(value) {
			options.scrollingSpeed = value;
		};

		/**
		 * ��ӻ�ɾ���еĹ�������ͨ��ʹ�������ֻ򴥿ذ�Ŀ����ԡ�
		 */
		$.fn.fullpage.setMouseWheelScrolling = function(value) {
			if (value) {
				addMouseWheelHandler();
			} else {
				removeMouseWheelHandler();
			}
		};

		/**
		 * ��ӻ�ɾ���Ŀ������еĹ�������ͨ��ʹ�������/���ذ�������ơ�
		 */
		$.fn.fullpage.setAllowScrolling = function(value) {
			if (value) {
				$.fn.fullpage.setMouseWheelScrolling(true);
				addTouchHandler();
			} else {
				$.fn.fullpage.setMouseWheelScrolling(false);
				removeTouchHandler();
			}
		};

		/**
		 * ��ӻ�ɾ��ͨ��ʹ�ü��̼�ͷ������������ֵĿ�����
		 */
		$.fn.fullpage.setKeyboardScrolling = function(value) {
			options.keyboardScrolling = value;
		};

		//Ϊ�˱���Ϊ���ۻ���ǳ����ٻ���������
		var slideMoving = false;

		var isTouchDevice = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|Windows Phone|Tizen|Bada)/);
		var isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));
		var container = $(this);
		var windowsHeight = $(window).height();
		var isMoving = false;
		var isResizing = false;
		var lastScrolledDestiny;
		var lastScrolledSlide;
		var wrapperSelector = 'fullpage-wrapper';

		$.fn.fullpage.setAllowScrolling(true);

		//�����֧�� css3��������ʹ�� jQuery �Ķ���
		if (options.css3) {
			options.css3 = support3d();
		}

		if ($(this).length) {
			container.css({
				'height': '100%',
				'position': 'relative',
				'-ms-touch-action': 'none'
			});

			//���һ���࣬��ʶ���ڲ��ڴ����е�����
			container.addClass(wrapperSelector);
		}

		//��ͼʹ����ҳû��һ��ѡ������
		else {
			console.error("Error! Fullpage.js needs to be initialized with a selector. For example: $('#myContainer').fullpage();");
		}

		//���ڲ���������ӵ���������Ч������
		$(options.sectionSelector).each(function() {
			$(this).addClass('fp-section');
		});
		$(options.slideSelector).each(function() {
			$(this).addClass('fp-slide');
		});

		//����������
		if (options.navigation) {
			$('body').append('<div id="fp-nav"><ul></ul></div>');
			var nav = $('#fp-nav');

			nav.css('color', options.navigationColor);
			nav.addClass(options.navigationPosition);
		}

		$('.fp-section').each(function(index) {
			var that = $(this);
			var slides = $(this).find('.fp-slide');
			var numSlides = slides.length;

			//if no active section is defined, the 1st one will be the default one
			if (!index && $('.fp-section.active').length === 0) {
				$(this).addClass('active');
			}

			$(this).css('height', windowsHeight + 'px');

			if (options.paddingTop || options.paddingBottom) {
				$(this).css('padding', options.paddingTop + ' 0 ' + options.paddingBottom + ' 0');
			}

			if (typeof options.sectionsColor[index] !== 'undefined') {
				$(this).css('background-color', options.sectionsColor[index]);
			}

			if (typeof options.anchors[index] !== 'undefined') {
				$(this).attr('data-anchor', options.anchors[index]);
			}

			if (options.navigation) {
				var link = '';
				if (options.anchors.length) {
					link = options.anchors[index];
				}
				var tooltip = options.navigationTooltips[index];
				if (typeof tooltip === 'undefined') {
					tooltip = '';
				}

				nav.find('ul').append('<li data-tooltip="' + tooltip + '"><a href="#' + link + '"><span></span></a></li>');
			}


			// if there's any slide
			if (numSlides > 1) {
				var sliderWidth = numSlides * 100;
				var slideWidth = 100 / numSlides;

				slides.wrapAll('<div class="fp-slidesContainer" />');
				slides.parent().wrap('<div class="fp-slides" />');

				$(this).find('.fp-slidesContainer').css('width', sliderWidth + '%');
				$(this).find('.fp-slides').after('<div class="fp-controlArrow fp-prev"></div><div class="fp-controlArrow fp-next"></div>');

				if (options.controlArrowColor != '#fff') {
					$(this).find('.fp-controlArrow.fp-next').css('border-color', 'transparent transparent transparent ' + options.controlArrowColor);
					$(this).find('.fp-controlArrow.fp-prev').css('border-color', 'transparent ' + options.controlArrowColor + ' transparent transparent');
				}

				if (!options.loopHorizontal) {
					$(this).find('.fp-controlArrow.fp-prev').hide();
				}


				if (options.slidesNavigation) {
					addSlidesNavigation($(this), numSlides);
				}

				slides.each(function(index) {
					var startingSlide = that.find('.fp-slide.active');

					//if the slide won#t be an starting point, the default will be the first one
					if (!index && startingSlide.length == 0) {
						$(this).addClass('active');
					}

					//is there a starting point for a non-starting section?
					else {
						silentLandscapeScroll(startingSlide);
					}

					$(this).css('width', slideWidth + '%');

					if (options.verticalCentered) {
						addTableClass($(this));
					}
				});
			} else {
				if (options.verticalCentered) {
					addTableClass($(this));
				}
			}



		}).promise().done(function() {
			$.fn.fullpage.setAutoScrolling(options.autoScrolling);

			//the starting point is a slide?
			var activeSlide = $('.fp-section.active').find('.fp-slide.active');

			//the active section isn't the first one? Is not the first slide of the first section? Then we load that section/slide by default.
			if (activeSlide.length && ($('.fp-section.active').index('.fp-section') != 0 || ($('.fp-section.active').index('.fp-section') == 0 && activeSlide.index() != 0))) {
				silentLandscapeScroll(activeSlide);
			}

			//fixed elements need to be moved out of the plugin container due to problems with CSS3.
			if (options.fixedElements && options.css3) {
				$(options.fixedElements).appendTo('body');
			}

			//vertical centered of the navigation + first bullet active
			if (options.navigation) {
				nav.css('margin-top', '-' + (nav.height() / 2) + 'px');
				nav.find('li').eq($('.fp-section.active').index('.fp-section')).find('a').addClass('active');
			}

			//moving the menu outside the main container if it is inside (avoid problems with fixed positions when using CSS3 tranforms)
			if (options.menu && options.css3 && $(options.menu).closest('.fullpage-wrapper').length) {
				$(options.menu).appendTo('body');
			}

			if (options.scrollOverflow) {
				if (container.hasClass('fullpage-used')) {
					createSlimScrollingHandler();
				}
				//after DOM and images are loaded
				$(window).on('load', createSlimScrollingHandler);
			} else {
				$.isFunction(options.afterRender) && options.afterRender.call(this);
			}


			//getting the anchor link in the URL and deleting the `#`
			var value = window.location.hash.replace('#', '').split('/');
			var destiny = value[0];

			if (destiny.length) {
				var section = $('[data-anchor="' + destiny + '"]');

				if (!options.animateAnchor && section.length) {

					if (options.autoScrolling) {
						silentScroll(section.position().top);
					} else {
						silentScroll(0);

						//scrolling the page to the section with no animation
						$('html, body').scrollTop(section.position().top);
					}

					activateMenuElement(destiny);
					activateNavDots(destiny, null);

					$.isFunction(options.afterLoad) && options.afterLoad.call(this, destiny, (section.index('.fp-section') + 1));

					//updating the active class
					section.addClass('active').siblings().removeClass('active');
				}
			}


			$(window).on('load', function() {
				scrollToAnchor();
			});

		});

		function createSlimScrollingHandler() {
			$('.fp-section').each(function() {
				var slides = $(this).find('.fp-slide');

				if (slides.length) {
					slides.each(function() {
						createSlimScrolling($(this));
					});
				} else {
					createSlimScrolling($(this));
				}

			});
			$.isFunction(options.afterRender) && options.afterRender.call(this);
		}


		var scrollId;
		var isScrolling = false;

		//when scrolling...
		$(window).on('scroll', scrollHandler);

		function scrollHandler() {
			if (!options.autoScrolling) {
				var currentScroll = $(window).scrollTop();

				var scrolledSections = $('.fp-section').map(function() {
					if ($(this).offset().top < (currentScroll + 100)) {
						return $(this);
					}
				});

				//geting the last one, the current one on the screen
				var currentSection = scrolledSections[scrolledSections.length - 1];

				//executing only once the first time we reach the section
				if (!currentSection.hasClass('active')) {
					var leavingSection = $('.fp-section.active').index('.fp-section') + 1;

					isScrolling = true;

					var yMovement = getYmovement(currentSection);

					currentSection.addClass('active').siblings().removeClass('active');

					var anchorLink = currentSection.data('anchor');
					$.isFunction(options.onLeave) && options.onLeave.call(this, leavingSection, (currentSection.index('.fp-section') + 1), yMovement);

					$.isFunction(options.afterLoad) && options.afterLoad.call(this, anchorLink, (currentSection.index('.fp-section') + 1));

					activateMenuElement(anchorLink);
					activateNavDots(anchorLink, 0);


					if (options.anchors.length && !isMoving) {
						//needed to enter in hashChange event when using the menu with anchor links
						lastScrolledDestiny = anchorLink;

						location.hash = anchorLink;
					}

					//small timeout in order to avoid entering in hashChange event when scrolling is not finished yet
					clearTimeout(scrollId);
					scrollId = setTimeout(function() {
						isScrolling = false;
					}, 100);
				}

			}
		}


		var touchStartY = 0;
		var touchStartX = 0;
		var touchEndY = 0;
		var touchEndX = 0;

		/* ��ⴥ���¼�
		 
		 * ���������ڱ仯�� top ����ҳ�ϵĹ��������ǲ����ô�ͳ�ķ�ʽ��⵽����
		 * ���ַ�ʽ��touchstart �ʹ����ƶ���ʾ��������һ��С������
		 * ��һ��ȷ���ķ���
		 */
		function touchMoveHandler(event) {
			var e = event.originalEvent;

			if (options.autoScrolling) {
				//preventing the easing on iOS devices
				event.preventDefault();
			}

			// additional: if one of the normalScrollElements isn't within options.normalScrollElementTouchThreshold hops up the DOM chain
			if (!checkParentForNormalScrollElement(event.target)) {

				var touchMoved = false;
				var activeSection = $('.fp-section.active');
				var scrollable;

				if (!isMoving && !slideMoving) { //if theres any #
					var touchEvents = getEventsPage(e);
					touchEndY = touchEvents['y'];
					touchEndX = touchEvents['x'];

					//if movement in the X axys is greater than in the Y and the currect section has slides...
					if (activeSection.find('.fp-slides').length && Math.abs(touchStartX - touchEndX) > (Math.abs(touchStartY - touchEndY))) {

						//is the movement greater than the minimum resistance to scroll?
						if (Math.abs(touchStartX - touchEndX) > ($(window).width() / 100 * options.touchSensitivity)) {
							if (touchStartX > touchEndX) {
								$.fn.fullpage.moveSlideRight(); //next
							} else {
								$.fn.fullpage.moveSlideLeft(); //prev
							}
						}
					}

					//vertical scrolling (only when autoScrolling is enabled)
					else if (options.autoScrolling) {

						//if there are landscape slides, we check if the scrolling bar is in the current one or not
						if (activeSection.find('.fp-slides').length) {
							scrollable = activeSection.find('.fp-slide.active').find('.fp-scrollable');
						} else {
							scrollable = activeSection.find('.fp-scrollable');
						}

						//is the movement greater than the minimum resistance to scroll?
						if (Math.abs(touchStartY - touchEndY) > ($(window).height() / 100 * options.touchSensitivity)) {
							if (touchStartY > touchEndY) {
								if (scrollable.length > 0) {
									//is the scrollbar at the end of the scroll?
									if (isScrolled('bottom', scrollable)) {
										$.fn.fullpage.moveSectionDown();
									} else {
										return true;
									}
								} else {
									// moved down
									$.fn.fullpage.moveSectionDown();
								}
							} else if (touchEndY > touchStartY) {

								if (scrollable.length > 0) {
									//is the scrollbar at the start of the scroll?
									if (isScrolled('top', scrollable)) {
										$.fn.fullpage.moveSectionUp();
									} else {
										return true;
									}
								} else {
									// moved up
									$.fn.fullpage.moveSectionUp();
								}
							}
						}
					}
				}
			}

		}

		/**
		 * �ݹ麯�����˸��ڵ㣬�Լ������֮һ options.normalScrollElements ���Ƿ����ѭ��
		 * Ŀǰ������ iOS-��׿ϵͳ������ҪһЩ����
		 * @param  {Element} el  target element / jquery selector (in subsequent nodes)
		 * @param  {int}     hop current hop compared to options.normalScrollElementTouchThreshold
		 * @return {boolean} true if there is a match to options.normalScrollElements
		 */
		function checkParentForNormalScrollElement(el, hop) {
			hop = hop || 0;
			var parent = $(el).parent();

			if (hop < options.normalScrollElementTouchThreshold &&
				parent.is(options.normalScrollElements)) {
				return true;
			} else if (hop == options.normalScrollElementTouchThreshold) {
				return false;
			} else {
				return checkParentForNormalScrollElement(parent, ++hop);
			}
		}

		function touchStartHandler(event) {
			var e = event.originalEvent;
			var touchEvents = getEventsPage(e);
			touchStartY = touchEvents['y'];
			touchStartX = touchEvents['x'];
		}


		/**
		 * ��������ֹ���
		 *
		 * http://blogs.sitepointstatic.com/examples/tech/mouse-wheel/index.html
		 * http://www.sitepoint.com/html5-javascript-mouse-wheel/
		 */
		function MouseWheelHandler(e) {
			if (options.autoScrolling) {
				// cross-browser wheel delta
				e = window.event || e;
				var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.deltaY || -e.detail)));
				var scrollable;
				var activeSection = $('.fp-section.active');

				if (!isMoving) { //if theres any #

					//if there are landscape slides, we check if the scrolling bar is in the current one or not
					if (activeSection.find('.fp-slides').length) {
						scrollable = activeSection.find('.fp-slide.active').find('.fp-scrollable');
					} else {
						scrollable = activeSection.find('.fp-scrollable');
					}

					//scrolling down?
					if (delta < 0) {
						if (scrollable.length > 0) {
							//is the scrollbar at the end of the scroll?
							if (isScrolled('bottom', scrollable)) {
								$.fn.fullpage.moveSectionDown();
							} else {
								return true; //normal scroll
							}
						} else {
							$.fn.fullpage.moveSectionDown();
						}
					}

					//scrolling up?
					else {
						if (scrollable.length > 0) {
							//is the scrollbar at the start of the scroll?
							if (isScrolled('top', scrollable)) {
								$.fn.fullpage.moveSectionUp();
							} else {
								return true; //normal scroll
							}
						} else {
							$.fn.fullpage.moveSectionUp();
						}
					}
				}

				return false;
			}
		}


		$.fn.fullpage.moveSectionUp = function() {
			var prev = $('.fp-section.active').prev('.fp-section');

			//looping to the bottom if there's no more sections above
			if (!prev.length && (options.loopTop || options.continuousVertical)) {
				prev = $('.fp-section').last();
			}

			if (prev.length) {
				scrollPage(prev, null, true);
			}
		};

		$.fn.fullpage.moveSectionDown = function() {
			var next = $('.fp-section.active').next('.fp-section');

			//looping to the top if there's no more sections below
			if (!next.length &&
				(options.loopBottom || options.continuousVertical)) {
				next = $('.fp-section').first();
			}

			if (next.length > 0 ||
				(!next.length &&
					(options.loopBottom || options.continuousVertical))) {
				scrollPage(next, null, false);
			}
		};

		$.fn.fullpage.moveTo = function(section, slide) {
			var destiny = '';

			if (isNaN(section)) {
				destiny = $('[data-anchor="' + section + '"]');
			} else {
				destiny = $('.fp-section').eq((section - 1));
			}

			if (typeof slide !== 'undefined') {
				scrollPageAndSlide(section, slide);
			} else if (destiny.length > 0) {
				scrollPage(destiny);
			}
		};

		$.fn.fullpage.moveSlideRight = function() {
			moveSlide('next');
		};

		$.fn.fullpage.moveSlideLeft = function() {
			moveSlide('prev');
		};

		function moveSlide(direction) {
			var activeSection = $('.fp-section.active');
			var slides = activeSection.find('.fp-slides');

			// more than one slide needed and nothing should be sliding
			if (!slides.length || slideMoving) {
				return;
			}

			var currentSlide = slides.find('.fp-slide.active');
			var destiny = null;

			if (direction === 'prev') {
				destiny = currentSlide.prev('.fp-slide');
			} else {
				destiny = currentSlide.next('.fp-slide');
			}

			//isn't there a next slide in the secuence?
			if (!destiny.length) {
				//respect loopHorizontal settin
				if (!options.loopHorizontal) return;

				if (direction === 'prev') {
					destiny = currentSlide.siblings(':last');
				} else {
					destiny = currentSlide.siblings(':first');
				}
			}

			slideMoving = true;

			landscapeScroll(slides, destiny);
		}

		function scrollPage(element, callback, isMovementUp) {
			var scrollOptions = {},
				scrolledElement;
			var dest = element.position();
			if (typeof dest === "undefined") {
				return;
			} //there's no element to scroll, leaving the function
			var dtop = dest.top;
			var yMovement = getYmovement(element);
			var anchorLink = element.data('anchor');
			var sectionIndex = element.index('.fp-section');
			var activeSlide = element.find('.fp-slide.active');
			var activeSection = $('.fp-section.active');
			var leavingSection = activeSection.index('.fp-section') + 1;

			//caching the value of isResizing at the momment the function is called
			//because it will be checked later inside a setTimeout and the value might change
			var localIsResizing = isResizing;

			if (activeSlide.length) {
				var slideAnchorLink = activeSlide.data('anchor');
				var slideIndex = activeSlide.index();
			}

			// If continuousVertical && we need to wrap around
			if (options.autoScrolling && options.continuousVertical && typeof(isMovementUp) !== "undefined" &&
				((!isMovementUp && yMovement == 'up') || // Intending to scroll down but about to go up or
					(isMovementUp && yMovement == 'down'))) { // intending to scroll up but about to go down

				// Scrolling down
				if (!isMovementUp) {
					// Move all previous sections to after the active section
					$(".fp-section.active").after(activeSection.prevAll(".fp-section").get().reverse());
				} else { // Scrolling up
					// Move all next sections to before the active section
					$(".fp-section.active").before(activeSection.nextAll(".fp-section"));
				}

				// Maintain the displayed position (now that we changed the element order)
				silentScroll($('.fp-section.active').position().top);

				// save for later the elements that still need to be reordered
				var wrapAroundElements = activeSection;

				// Recalculate animation variables
				dest = element.position();
				dtop = dest.top;
				yMovement = getYmovement(element);
			}


			element.addClass('active').siblings().removeClass('active');

			//preventing from activating the MouseWheelHandler event
			//more than once if the page is scrolling
			isMoving = true;

			if (typeof anchorLink !== 'undefined') {
				setURLHash(slideIndex, slideAnchorLink, anchorLink);
			}

			if (options.autoScrolling) {
				scrollOptions['top'] = -dtop;
				scrolledElement = '.' + wrapperSelector;
			} else {
				scrollOptions['scrollTop'] = dtop;
				scrolledElement = 'html, body';
			}

			// Fix section order after continuousVertical changes have been animated
			var continuousVerticalFixSectionOrder = function() {
				// If continuousVertical is in effect (and autoScrolling would also be in effect then),
				// finish moving the elements around so the direct navigation will function more simply
				if (!wrapAroundElements || !wrapAroundElements.length) {
					return;
				}

				if (isMovementUp) {
					$('.fp-section:first').before(wrapAroundElements);
				} else {
					$('.fp-section:last').after(wrapAroundElements);
				}

				silentScroll($('.fp-section.active').position().top);
			};


			// Use CSS3 translate functionality or...
			if (options.css3 && options.autoScrolling) {

				//callback (onLeave) if the site is not just resizing and readjusting the slides
				$.isFunction(options.onLeave) && !localIsResizing && options.onLeave.call(this, leavingSection, (sectionIndex + 1), yMovement);


				var translate3d = 'translate3d(0px, -' + dtop + 'px, 0px)';
				transformContainer(translate3d, true);

				setTimeout(function() {
					//fix section order from continuousVertical
					continuousVerticalFixSectionOrder();

					//callback (afterLoad) 	if the site is not just resizing and readjusting the slides
					$.isFunction(options.afterLoad) && !localIsResizing && options.afterLoad.call(this, anchorLink, (sectionIndex + 1));

					setTimeout(function() {
						isMoving = false;
						$.isFunction(callback) && callback.call(this);
					}, scrollDelay);
				}, options.scrollingSpeed);
			} else { // ... use jQuery animate

				//callback (onLeave) if the site is not just resizing and readjusting the slides
				$.isFunction(options.onLeave) && !localIsResizing && options.onLeave.call(this, leavingSection, (sectionIndex + 1), yMovement);

				$(scrolledElement).animate(
					scrollOptions, options.scrollingSpeed, options.easing, function() {
						//fix section order from continuousVertical
						continuousVerticalFixSectionOrder();

						//callback (afterLoad) if the site is not just resizing and readjusting the slides
						$.isFunction(options.afterLoad) && !localIsResizing && options.afterLoad.call(this, anchorLink, (sectionIndex + 1));

						setTimeout(function() {
							isMoving = false;
							$.isFunction(callback) && callback.call(this);
						}, scrollDelay);
					});
			}

			//flag to avoid callingn `scrollPage()` twice in case of using anchor links
			lastScrolledDestiny = anchorLink;

			//avoid firing it twice (as it does also on scroll)
			if (options.autoScrolling) {
				activateMenuElement(anchorLink);
				activateNavDots(anchorLink, sectionIndex);
			}
		}

		function scrollToAnchor() {
			//getting the anchor link in the URL and deleting the `#`
			var value = window.location.hash.replace('#', '').split('/');
			var section = value[0];
			var slide = value[1];

			if (section) { //if theres any #
				scrollPageAndSlide(section, slide);
			}
		}

		//Ҫ���������ض���ê���ӵ� URL �ϵ��κα仯���
		//(a way to detect back history button as we play with the hashes on the URL)
		$(window).on('hashchange', hashChangeHandler);

		function hashChangeHandler() {
			if (!isScrolling) {
				var value = window.location.hash.replace('#', '').split('/');
				var section = value[0];
				var slide = value[1];

				if (section.length) {
					//when moving to a slide in the first section for the first time (first time to add an anchor to the URL)
					var isFirstSlideMove = (typeof lastScrolledDestiny === 'undefined');
					var isFirstScrollMove = (typeof lastScrolledDestiny === 'undefined' && typeof slide === 'undefined' && !slideMoving);

					/*in order to call scrollpage() only once for each destination at a time
					It is called twice for each scroll otherwise, as in case of using anchorlinks `hashChange`
					event is fired on every scroll too.*/
					if ((section && section !== lastScrolledDestiny) && !isFirstSlideMove || isFirstScrollMove || (!slideMoving && lastScrolledSlide != slide)) {
						scrollPageAndSlide(section, slide);
					}
				}
			}
		}


		/**
		 * ʹ�ü�ͷ����ˮƽ�ʹ�ֱ����������
		 */
		$(document).keydown(function(e) {
			//Moving the main page with the keyboard arrows if keyboard scrolling is enabled
			if (options.keyboardScrolling && !isMoving) {
				switch (e.which) {
					//up
					case 38:
					case 33:
						$.fn.fullpage.moveSectionUp();
						break;

						//down
					case 40:
					case 34:
						$.fn.fullpage.moveSectionDown();
						break;

						//Home
					case 36:
						$.fn.fullpage.moveTo(1);
						break;

						//End
					case 35:
						$.fn.fullpage.moveTo($('.fp-section').length);
						break;

						//left
					case 37:
						$.fn.fullpage.moveSlideLeft();
						break;

						//right
					case 39:
						$.fn.fullpage.moveSlideRight();
						break;

					default:
						return; // exit this handler for other keys
				}
			}
		});

		//�����ж�
		$(document).on('click', '#fp-nav a', function(e) {
			e.preventDefault();
			var index = $(this).parent().index();
			scrollPage($('.fp-section').eq(index));
		});

		//����������ʾ
		$(document).on({
			mouseenter: function() {
				var tooltip = $(this).data('tooltip');
				$('<div class="fp-tooltip ' + options.navigationPosition + '">' + tooltip + '</div>').hide().appendTo($(this)).fadeIn(200);
			},
			mouseleave: function() {
				$(this).find('.fp-tooltip').fadeOut().remove();
			}
		}, '#fp-nav li');


		if (options.normalScrollElements) {
			$(document).on('mouseenter', options.normalScrollElements, function() {
				$.fn.fullpage.setMouseWheelScrolling(false);
			});

			$(document).on('mouseleave', options.normalScrollElements, function() {
				$.fn.fullpage.setMouseWheelScrolling(true);
			});
		}

		/**
		 * ˮƽ��������ؼ��ϵ���ʱ��
		 */
		$('.fp-section').on('click', '.fp-controlArrow', function() {
			if ($(this).hasClass('fp-prev')) {
				$.fn.fullpage.moveSlideLeft();
			} else {
				$.fn.fullpage.moveSlideRight();
			}
		});


		/**
		 * ˮƽ��������ؼ��ϵ���ʱ��
		 */
		$('.fp-section').on('click', '.toSlide', function(e) {
			e.preventDefault();

			var slides = $(this).closest('.fp-section').find('.fp-slides');
			var currentSlide = slides.find('.fp-slide.active');
			var destiny = null;

			destiny = slides.find('.fp-slide').eq(($(this).data('index') - 1));

			if (destiny.length > 0) {
				landscapeScroll(slides, destiny);
			}
		});

		/**
		 *����ˮƽ���顣
		 */
		function landscapeScroll(slides, destiny) {
			var destinyPos = destiny.position();
			var slidesContainer = slides.find('.fp-slidesContainer').parent();
			var slideIndex = destiny.index();
			var section = slides.closest('.fp-section');
			var sectionIndex = section.index('.fp-section');
			var anchorLink = section.data('anchor');
			var slidesNav = section.find('.fp-slidesNav');
			var slideAnchor = destiny.data('anchor');

			// ������һ�̺��� isResizing ��ֵ������
			// ��Ϊ�������Ժ�����͵�ֵ���ܻ����
			var localIsResizing = isResizing;

			if (options.onSlideLeave) {
				var prevSlideIndex = section.find('.fp-slide.active').index();
				var xMovement = getXmovement(prevSlideIndex, slideIndex);

				//�������վ�ǲ�ֻ�ǵ�����С�͵����õ�Ƭ
				if (!localIsResizing) {
					$.isFunction(options.onSlideLeave) && options.onSlideLeave.call(this, anchorLink, (sectionIndex + 1), prevSlideIndex, xMovement);
				}
			}

			destiny.addClass('active').siblings().removeClass('active');


			if (typeof slideAnchor === 'undefined') {
				slideAnchor = slideIndex;
			}

			if (!options.loopHorizontal) {
				//��������ȭͷ�õ�Ƭ��չʾ������
				section.find('.fp-controlArrow.fp-prev').toggle(slideIndex != 0);

				//���������һ�Żõ�Ƭ��չʾ������
				section.find('.fp-controlArrow.fp-next').toggle(!destiny.is(':last-child'));
			}

			//ֻ�и��� URL������õ�Ƭ�еĵ�ǰ�� ����������С���µ�����
			if (section.hasClass('active')) {
				setURLHash(slideIndex, slideAnchor, anchorLink);
			}

			if (options.css3) {
				var translate3d = 'translate3d(-' + destinyPos.left + 'px, 0px, 0px)';

				slides.find('.fp-slidesContainer').toggleClass('fp-easing', options.scrollingSpeed > 0).css(getTransforms(translate3d));

				setTimeout(function() {
					//�������վ�ǲ�ֻ�ǵ�����С�͵����õ�Ƭ
					if (!localIsResizing) {
						$.isFunction(options.afterSlideLoad) && options.afterSlideLoad.call(this, anchorLink, (sectionIndex + 1), slideAnchor, slideIndex);
					}

					slideMoving = false;
				}, options.scrollingSpeed, options.easing);
			} else {
				slidesContainer.animate({
					scrollLeft: destinyPos.left
				}, options.scrollingSpeed, options.easing, function() {

					//�������վ�ǲ�ֻ�ǵ�����С�͵����õ�Ƭ
					if (!localIsResizing) {
						$.isFunction(options.afterSlideLoad) && options.afterSlideLoad.call(this, anchorLink, (sectionIndex + 1), slideAnchor, slideIndex);
					}
					//�������ٴλ�
					slideMoving = false;
				});
			}

			slidesNav.find('.active').removeClass('active');
			slidesNav.find('li').eq(slideIndex).find('a').addClass('active');
		}


		var resizeId;

		//��վ��Ĵ�С���������ǵ����Ĳ��֣�slimScroll �ĸ߶�......
		$(window).resize(function() {
			// �����豸�������ؽ�
			if (isTouchDevice) {
				$.fn.fullpage.reBuild();
			} else {
				//Ҫ���õĺ�����ֻ�е��������
				//http://stackoverflow.com/questions/4298612/jquery-how-to-call-resize-event-only-once-its-finished-resizing
				clearTimeout(resizeId);

				resizeId = setTimeout($.fn.fullpage.reBuild, 500);
			}
		});


		/**
		 * ��������Ϻ�ʱ�����ǵ����õ�Ƭ��С��λ��
		 */
		$.fn.fullpage.reBuild = function() {
			isResizing = true;

			var windowsWidth = $(window).width();
			windowsHeight = $(window).height();

			//�ı���ͼ�������С
			if (options.resize) {
				resizeMe(windowsHeight, windowsWidth);
			}

			$('.fp-section').each(function() {
				var scrollHeight = windowsHeight - parseInt($(this).css('padding-bottom')) - parseInt($(this).css('padding-top'));

				//�������ĵ�Ԫ��ĸ߶�Ϊ IE �ͻ�������
				if (options.verticalCentered) {
					$(this).find('.fp-tableCell').css('height', getTableHeight($(this)) + 'px');
				}

				$(this).css('height', windowsHeight + 'px');

				//������С�Ĺ��� div
				if (options.scrollOverflow) {
					var slides = $(this).find('.fp-slide');

					if (slides.length) {
						slides.each(function() {
							createSlimScrolling($(this));
						});
					} else {
						createSlimScrolling($(this));
					}

				}

				//����λ�÷�ȫ��õ�Ƭ...
				var slides = $(this).find('.fp-slides');
				if (slides.length) {
					landscapeScroll(slides, slides.find('.fp-slide.active'));
				}
			});

			//������ǰ�ڵ�λ��
			var destinyPos = $('.fp-section.active').position();

			var activeSection = $('.fp-section.active');

			//�ǲ��ǵ�һ����
			if (activeSection.index('.fp-section')) {
				scrollPage(activeSection);
			}

			isResizing = false;
			$.isFunction(options.afterResize) && options.afterResize.call(this);
		}

		/**
		 * ���������С�洰�ڵĴ�С���Լ�һЩ��վ�ϵ�ͼ��Ĵ�С��
		 */
		function resizeMe(displayHeight, displayWidth) {
			//��׼�߶ȣ�Ϊ����������Ĵ�С����ȷ
			var preferredHeight = 825;
			var windowSize = displayHeight;

			/* ؽ�����������

			if (displayHeight < 825) {
				var percentage = (windowSize * 100) / preferredHeight;
				var newFontSize = percentage.toFixed(2);

				$("img").each(function() {
					var newWidth = ((80 * percentage) / 100).toFixed(2);
					$(this).css("width", newWidth + '%');
				});
			} else {
				$("img").each(function() {
					$(this).css("width", '');
				});
			}*/

			if (displayHeight < 825 || displayWidth < 900) {
				if (displayWidth < 900) {
					windowSize = displayWidth;
					preferredHeight = 900;
				}
				var percentage = (windowSize * 100) / preferredHeight;
				var newFontSize = percentage.toFixed(2);

				$("body").css("font-size", newFontSize + '%');
			} else {
				$("body").css("font-size", '100%');
			}
		}

		/**
		 * ������վ��������ݸ����Ļõ�Ƭ���ơ�
		 */
		function activateNavDots(name, sectionIndex) {
			if (options.navigation) {
				$('#fp-nav').find('.active').removeClass('active');
				if (name) {
					$('#fp-nav').find('a[href="#' + name + '"]').addClass('active');
				} else {
					$('#fp-nav').find('li').eq(sectionIndex).find('a').addClass('active');
				}
			}
		}

		/**
		 * ������վ���˵�Ԫ�ذ��ո����Ļõ�Ƭ�����ơ�
		 */
		function activateMenuElement(name) {
			if (options.menu) {
				$(options.menu).find('.active').removeClass('active');
				$(options.menu).find('[data-menuanchor="' + name + '"]').addClass('active');
			}
		}

		/**
* ����һ������ֵ�����ݿɹ���Ԫ�����ڽ����˻����ڹ��������
����һ����������͡�
*/
		function isScrolled(type, scrollable) {
			if (type === 'top') {
				return !scrollable.scrollTop();
			} else if (type === 'bottom') {
				return scrollable.scrollTop() + 1 + scrollable.innerHeight() >= scrollable[0].scrollHeight;
			}
		}

		/**
		 * Retuns '����' ���� '����' ȡ���ڵ�����Ŀ�ĵصĹ����˶�
		 * �ӵ�ǰ�ڡ�
		 */
		function getYmovement(destiny) {
			var fromIndex = $('.fp-section.active').index('.fp-section');
			var toIndex = destiny.index('.fp-section');

			if (fromIndex > toIndex) {
				return 'up';
			}
			return 'down';
		}

		/**
		 * Retuns '��ȷ' �� '��' �ӹ����˶�������Ŀ�ĵ�
		 * �ӵ�ǰ�õ�Ƭ��ʼ��
		 */
		function getXmovement(fromIndex, toIndex) {
			if (fromIndex == toIndex) {
				return 'none'
			}
			if (fromIndex > toIndex) {
				return 'left';
			}
			return 'right';
		}


		function createSlimScrolling(element) {
			//��Ҫ���� 'scrollHeight' �ڸ�� 12 �¹���
			element.css('overflow', 'hidden');

			//�ڰ����е�Ԫ����һ�Żõ�Ƭ
			var section = element.closest('.fp-section');
			var scrollable = element.find('.fp-scrollable');

			//����й�����contentHeight ���ǿɹ���һ���е�һ
			if (scrollable.length) {
				var contentHeight = scrollable.get(0).scrollHeight;
			} else {
				var contentHeight = element.get(0).scrollHeight;
				if (options.verticalCentered) {
					contentHeight = element.find('.fp-tableCell').get(0).scrollHeight;
				}
			}

			var scrollHeight = windowsHeight - parseInt(section.css('padding-bottom')) - parseInt(section.css('padding-top'));

			//��Ҫ������
			if (contentHeight > scrollHeight) {
				//�Ѿ������˹����𣿸�����
				if (scrollable.length) {
					scrollable.css('height', scrollHeight + 'px').parent().css('height', scrollHeight + 'px');
				}
				//��������
				else {
					if (options.verticalCentered) {
						element.find('.fp-tableCell').wrapInner('<div class="fp-scrollable" />');
					} else {
						element.wrapInner('<div class="fp-scrollable" />');
					}


					element.find('.fp-scrollable').slimScroll({
						allowPageScroll: true,
						height: scrollHeight + 'px',
						size: '10px',
						alwaysVisible: true
					});
				}
			}

			//ɾ������ʱ��û�б�Ҫ��
			else {
				removeSlimScroll(element);
			}

			//����
			element.css('overflow', '');
		}

		function removeSlimScroll(element) {
			element.find('.fp-scrollable').children().first().unwrap().unwrap();
			element.find('.slimScrollBar').remove();
			element.find('.slimScrollRail').remove();
		}

		function addTableClass(element) {
			element.addClass('fp-table').wrapInner('<div class="fp-tableCell" style="height:' + getTableHeight(element) + 'px;" />');
		}

		function getTableHeight(element) {
			var sectionHeight = windowsHeight;

			if (options.paddingTop || options.paddingBottom) {
				var section = element;
				if (!section.hasClass('fp-section')) {
					section = element.closest('.fp-section');
				}

				var paddings = parseInt(section.css('padding-top')) + parseInt(section.css('padding-bottom'));
				sectionHeight = (windowsHeight - paddings);
			}

			return sectionHeight;
		}

		/**
		 * ���������л�û�и��ݶ��� param ������� css3 �任���ԡ�
		 */
		function transformContainer(translate3d, animated) {
			container.toggleClass('fp-easing', animated);

			container.css(getTransforms(translate3d));
		}


		/**
		 * �����������Ľںͻõ�Ƭ
		 */
		function scrollPageAndSlide(destiny, slide) {
			if (typeof slide === 'undefined') {
				slide = 0;
			}

			if (isNaN(destiny)) {
				var section = $('[data-anchor="' + destiny + '"]');
			} else {
				var section = $('.fp-section').eq((destiny - 1));
			}


			//������Ҫ���¹��������֣�Ȼ�󵽻õ�Ƭ
			if (destiny !== lastScrolledDestiny && !section.hasClass('active')) {
				scrollPage(section, function() {
					scrollSlider(section, slide)
				});
			}
			//��������Ѿ��ڲ���
			else {
				scrollSlider(section, slide);
			}
		}

		/**
		 * �����������ڸ����Ļõ�ƬĿ�ĵػ���
		 */
		function scrollSlider(section, slide) {
			if (typeof slide != 'undefined') {
				var slides = section.find('.fp-slides');
				var destiny = slides.find('[data-anchor="' + slide + '"]');

				if (!destiny.length) {
					destiny = slides.find('.fp-slide').eq(slide);
				}

				if (destiny.length) {
					landscapeScroll(slides, destiny);
				}
			}
		}

		/**
		 * ��������ˮƽ�����ɵ㹹�ɵľ��۵�������
		 */
		function addSlidesNavigation(section, numSlides) {
			section.append('<div class="fp-slidesNav"><ul></ul></div>');
			var nav = section.find('.fp-slidesNav');

			//������ײ�
			nav.addClass(options.slidesNavPosition);

			for (var i = 0; i < numSlides; i++) {
				nav.find('ul').append('<li><a href="#"><span></span></a></li>');
			}

			//����Ϊ����
			nav.css('margin-left', '-' + (nav.width() / 2) + 'px');

			nav.find('li').first().find('a').addClass('active');
		}


		/**
		 * ����ͼ��� URL �Ļõ�Ƭ��һ�ι�ϣֵ
		 */
		function setURLHash(slideIndex, slideAnchor, anchorLink) {
			var sectionHash = '';

			if (options.anchors.length) {

				//�ǲ��ǵ�һ�Żõ�Ƭ��
				if (slideIndex) {
					if (typeof anchorLink !== 'undefined') {
						sectionHash = anchorLink;
					}

					//��ê���ӻõ�Ƭ���෴�����ǲ�ȡ������
					if (typeof slideAnchor === 'undefined') {
						slideAnchor = slideIndex;
					}

					lastScrolledSlide = slideAnchor;
					location.hash = sectionHash + '/' + slideAnchor;

					//��һ�Żõ�Ƭ�����лõ�Ƭê��ֻ�ǵ�һ��
				} else if (typeof slideIndex !== 'undefined') {
					lastScrolledSlide = slideAnchor;
					location.hash = anchorLink;
				}

				//û�лõ�Ƭ��
				else {
					location.hash = anchorLink;
				}
			}
		}

		/**
		 * �����������ڸ����Ļõ�ƬĿ�ĵػ���
		 */
		$(document).on('click', '.fp-slidesNav a', function(e) {
			e.preventDefault();
			var slides = $(this).closest('.fp-section').find('.fp-slides');
			var destiny = slides.find('.fp-slide').eq($(this).closest('li').index());

			landscapeScroll(slides, destiny);
		});


		/**
		 * ��� translate3d ��֧��
		 * @return boolean
		 * http://stackoverflow.com/questions/5661671/detecting-transform-translate3d-support
		 */
		function support3d() {
			var el = document.createElement('p'),
				has3d,
				transforms = {
					'webkitTransform': '-webkit-transform',
					'OTransform': '-o-transform',
					'msTransform': '-ms-transform',
					'MozTransform': '-moz-transform',
					'transform': 'transform'
				};

			// ������ӵ�����õ�����ķ��
			document.body.insertBefore(el, null);

			for (var t in transforms) {
				if (el.style[t] !== undefined) {
					el.style[t] = "translate3d(1px,1px,1px)";
					has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
				}
			}

			document.body.removeChild(el);

			return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
		}



		/**
		 * �Ƴ��Զ������ж�����������ֺ� tackpad��
		 * ���ô˺����󣬲���ͨ���ڹ����������ֺʹ��ذ���˶���
		 */
		function removeMouseWheelHandler() {
			if (document.addEventListener) {
				document.removeEventListener('mousewheel', MouseWheelHandler, false); //IE9, Chrome, Safari, Oper
				document.removeEventListener('wheel', MouseWheelHandler, false); //Firefox
			} else {
				document.detachEvent("onmousewheel", MouseWheelHandler); //IE 6/7/8
			}
		}


		/**
		 * ������Զ����������ֺ� tackpad ���ж���
		 * ���ô˺�����������ֺʹ��ذ���˶����������
		 */
		function addMouseWheelHandler() {
			if (document.addEventListener) {
				document.addEventListener("mousewheel", MouseWheelHandler, false); //IE9, Chrome, Safari, Oper
				document.addEventListener("wheel", MouseWheelHandler, false); //Firefox
			} else {
				document.attachEvent("onmousewheel", MouseWheelHandler); //IE 6/7/8
			}
		}


		/**
		 * �Զ�����ͨ�������豸�Ͻ�����ӿ����ԡ�
		 */
		function addTouchHandler() {
			if (isTouchDevice || isTouch) {
				//Microsoft pointers
				MSPointer = getMSPointer();

				$(document).off('touchstart ' + MSPointer.down).on('touchstart ' + MSPointer.down, touchStartHandler);
				$(document).off('touchmove ' + MSPointer.move).on('touchmove ' + MSPointer.move, touchMoveHandler);
			}
		}

		/**
		 * ɾ���Զ������Ĵ����豸��
		 */
		function removeTouchHandler() {
			if (isTouchDevice || isTouch) {
				//Microsoft pointers
				MSPointer = getMSPointer();

				$(document).off('touchstart ' + MSPointer.down);
				$(document).off('touchmove ' + MSPointer.move);
			}
		}


		/*
		 * ���غ� Microsoft ָ����� ���� IE < 11 �� ie > = 11��
		 * http://msdn.microsoft.com/en-us/library/ie/dn304886(v=vs.85).aspx
		 */
		function getMSPointer() {
			var pointer;

			//IE >= 11
			if (window.PointerEvent) {
				pointer = {
					down: "pointerdown",
					move: "pointermove"
				};
			}

			//IE < 11
			else {
				pointer = {
					down: "MSPointerDown",
					move: "MSPointerMove"
				};
			}

			return pointer;
		}
		/**
		 * ��ȡ pageX �͸���������� pageY ���ԡ�
		 * https://github.com/alvarotrigo/fullPage.js/issues/194#issuecomment-34069854
		 */
		function getEventsPage(e) {
			var events = new Array();
			if (window.navigator.msPointerEnabled) {
				events['y'] = e.pageY;
				events['x'] = e.pageX;
			} else {
				events['y'] = e.touches[0].pageY;
				events['x'] = e.touches[0].pageX;
			}

			return events;
		}

		function silentLandscapeScroll(activeSlide) {
			var prevScrollingSpeepd = options.scrollingSpeed;
			$.fn.fullpage.setScrollingSpeed(0);
			landscapeScroll(activeSlide.closest('.fp-slides'), activeSlide);
			$.fn.fullpage.setScrollingSpeed(prevScrollingSpeepd);
		}

		function silentScroll(top) {
			if (options.css3) {
				var translate3d = 'translate3d(0px, -' + top + 'px, 0px)';
				transformContainer(translate3d, false);
			} else {
				container.css("top", -top);
			}
		}

		function getTransforms(translate3d) {
			return {
				'-webkit-transform': translate3d,
				'-moz-transform': translate3d,
				'-ms-transform': translate3d,
				'transform': translate3d
			};
		}


		/*
		 * �Ƴ� fullpage.js ����¼��� optinally���� html ��Ǻ���ʽ
		 */
		$.fn.fullpage.destroy = function(all) {
			$.fn.fullpage.setAutoScrolling(false);
			$.fn.fullpage.setAllowScrolling(false);
			$.fn.fullpage.setKeyboardScrolling(false);


			$(window)
				.off('scroll', scrollHandler)
				.off('hashchange', hashChangeHandler);

			$(document)
				.off('click', '#fp-nav a')
				.off('mouseenter', '#fp-nav li')
				.off('mouseleave', '#fp-nav li')
				.off('click', '.fp-slidesNav a')
				.off('mouseover', options.normalScrollElements)
				.off('mouseout', options.normalScrollElements);

			$('.fp-section')
				.off('click', '.fp-controlArrow')
				.off('click', '.toSlide');

			//�����Ƴ�
			if (all) {
				destroyStructure();
			}
		};

		/*
		 * ɾ��������ʽ�� fullpage.js ���
		 */
		function destroyStructure() {
			//���� '��' ���� '����' ����Ϊ 0
			silentScroll(0);

			$('#fp-nav, .fp-slidesNav, .fp-controlArrow').remove();

			//ɾ��������ʽ
			$('.fp-section').css({
				'height': '',
				'background-color': '',
				'padding': ''
			});

			$('.fp-slide').css({
				'width': ''
			});

			container.css({
				'height': '',
				'position': '',
				'-ms-touch-action': ''
			});

			//ɾ����ӵ���
			$('.fp-section, .fp-slide').each(function() {
				removeSlimScroll($(this));
				$(this).removeClass('fp-table active');
			})

			container.find('.fp-easing').removeClass('fp-easing');

			//չ������
			container.find('.fp-tableCell, .fp-slidesContainer, .fp-slides').each(function() {
				//�⿪����ʹ����һ������û����Ԫ�أ���ֻ���ı�
				$(this).replaceWith(this.childNodes);
			});

			//������������û�ж���ҳ
			$('html, body').scrollTop(0);

			//Ҫ֪���Ƿ��������Ѿ����������ʹ�����ڽ����ٴ�ʹ��
			container.addClass('fullpage-used');
		}

	};

})(jQuery);