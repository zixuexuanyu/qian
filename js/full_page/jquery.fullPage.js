/**
 * fullPage 2.2.1
 * https://github.com/alvarotrigo/fullPage.js
 * MIT licensed
 *
 * Copyright (C) 2013 alvarotrigo.com - A project by Alvaro Trigo
 */

(function($) {
	$.fn.fullpage = function(options) {
		// 创建一些默认值，与修改它们的选项
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

			//事件
			'afterLoad': null,
			'onLeave': null,
			'afterRender': null,
			'afterResize': null,
			'afterSlideLoad': null,
			'onSlideLeave': null
		}, options);

		// 禁用互斥的设置
		if (options.continuousVertical &&
			(options.loopTop || options.loopBottom)) {
			options.continuousVertical = false;
			console && console.log && console.log("Option loopTop/loopBottom is mutually exclusive with continuousVertical; continuousVertical disabled");
		}

		// 定义了延迟在能够滚动到下一节之前采取的地方
		// 小心！不推荐去改变它下 400 在笔记本电脑中的良好行为和
		// 苹果设备 （笔记本电脑、 老鼠......)
		var scrollDelay = 600;

		//设置页面滚动方式，设置为 true 时自动滚动
		$.fn.fullpage.setAutoScrolling = function(value) {
			options.autoScrolling = value;

			var element = $('.fp-section.active');

			if (options.autoScrolling) {
				$('html, body').css({
					'overflow': 'hidden',
					'height': '100%'
				});

				if (element.length) {
					//向上移动容器
					silentScroll(element.position().top);
				}

			} else {
				$('html, body').css({
					'overflow': 'auto',
					'height': 'auto'
				});

				silentScroll(0);

				//滚动到的部分与没有动画页
				$('html, body').scrollTop(element.position().top);
			}

		};

		/**
		 * 定义以毫秒为单位的滚动速度
		 */
		$.fn.fullpage.setScrollingSpeed = function(value) {
			options.scrollingSpeed = value;
		};

		/**
		 * 添加或删除中的滚动部分通过使用鼠标滚轮或触控板的可能性。
		 */
		$.fn.fullpage.setMouseWheelScrolling = function(value) {
			if (value) {
				addMouseWheelHandler();
			} else {
				removeMouseWheelHandler();
			}
		};

		/**
		 * 添加或删除的可能性中的滚动部分通过使用鼠标轮/触控板或触摸手势。
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
		 * 添加或删除通过使用键盘箭头键滚动浏览部分的可能性
		 */
		$.fn.fullpage.setKeyboardScrolling = function(value) {
			options.keyboardScrolling = value;
		};

		//为了避免为景观滑块非常快速滑动的旗帜
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

		//如果不支持 css3，则它将使用 jQuery 的动画
		if (options.css3) {
			options.css3 = support3d();
		}

		if ($(this).length) {
			container.css({
				'height': '100%',
				'position': 'relative',
				'-ms-touch-action': 'none'
			});

			//添加一个类，以识别内部在代码中的容器
			container.addClass(wrapperSelector);
		}

		//试图使用整页没有一个选择器吗？
		else {
			console.error("Error! Fullpage.js needs to be initialized with a selector. For example: $('#myContainer').fullpage();");
		}

		//将内部类名称添加到常见的无效的问题
		$(options.sectionSelector).each(function() {
			$(this).addClass('fp-section');
		});
		$(options.slideSelector).each(function() {
			$(this).addClass('fp-slide');
		});

		//创建导航点
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

		/* 检测触摸事件
		 
		 * 由于我们在变化的 top 属性页上的滚动，我们不能用传统的方式检测到它。
		 * 这种方式，touchstart 和触摸移动显示他们这是一个小的区别
		 * 用一个确定的方向。
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
		 * 递归函数来了父节点，以检查其中之一 options.normalScrollElements 中是否存在循环
		 * 目前适用于 iOS-安卓系统可能需要一些测试
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
		 * 检测鼠标滚轮滚动
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

		//要滚动到的特定的锚链接的 URL 上的任何变化检测
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
		 * 使用箭头键，水平和垂直两个，滑动
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

		//导航行动
		$(document).on('click', '#fp-nav a', function(e) {
			e.preventDefault();
			var index = $(this).parent().index();
			scrollPage($('.fp-section').eq(index));
		});

		//导航工具提示
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
		 * 水平滚动滑块控件上单击时。
		 */
		$('.fp-section').on('click', '.fp-controlArrow', function() {
			if ($(this).hasClass('fp-prev')) {
				$.fn.fullpage.moveSlideLeft();
			} else {
				$.fn.fullpage.moveSlideRight();
			}
		});


		/**
		 * 水平滚动滑块控件上单击时。
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
		 *滚动水平滑块。
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

			// 缓存在一刻函数 isResizing 的值被调用
			// 因为它会检查以后里面和的值可能会更改
			var localIsResizing = isResizing;

			if (options.onSlideLeave) {
				var prevSlideIndex = section.find('.fp-slide.active').index();
				var xMovement = getXmovement(prevSlideIndex, slideIndex);

				//如果该网站是不只是调整大小和调整幻灯片
				if (!localIsResizing) {
					$.isFunction(options.onSlideLeave) && options.onSlideLeave.call(this, anchorLink, (sectionIndex + 1), prevSlideIndex, xMovement);
				}
			}

			destiny.addClass('active').siblings().removeClass('active');


			if (typeof slideAnchor === 'undefined') {
				slideAnchor = slideIndex;
			}

			if (!options.loopHorizontal) {
				//隐藏它，拳头幻灯片，展示的余生
				section.find('.fp-controlArrow.fp-prev').toggle(slideIndex != 0);

				//隐藏它最后一张幻灯片，展示的余生
				section.find('.fp-controlArrow.fp-next').toggle(!destiny.is(':last-child'));
			}

			//只有更改 URL，如果幻灯片中的当前节 （不调整大小重新调整）
			if (section.hasClass('active')) {
				setURLHash(slideIndex, slideAnchor, anchorLink);
			}

			if (options.css3) {
				var translate3d = 'translate3d(-' + destinyPos.left + 'px, 0px, 0px)';

				slides.find('.fp-slidesContainer').toggleClass('fp-easing', options.scrollingSpeed > 0).css(getTransforms(translate3d));

				setTimeout(function() {
					//如果该网站是不只是调整大小和调整幻灯片
					if (!localIsResizing) {
						$.isFunction(options.afterSlideLoad) && options.afterSlideLoad.call(this, anchorLink, (sectionIndex + 1), slideAnchor, slideIndex);
					}

					slideMoving = false;
				}, options.scrollingSpeed, options.easing);
			} else {
				slidesContainer.animate({
					scrollLeft: destinyPos.left
				}, options.scrollingSpeed, options.easing, function() {

					//如果该网站是不只是调整大小和调整幻灯片
					if (!localIsResizing) {
						$.isFunction(options.afterSlideLoad) && options.afterSlideLoad.call(this, anchorLink, (sectionIndex + 1), slideAnchor, slideIndex);
					}
					//让他们再次滑
					slideMoving = false;
				});
			}

			slidesNav.find('.active').removeClass('active');
			slidesNav.find('li').eq(slideIndex).find('a').addClass('active');
		}


		var resizeId;

		//当站点的大小调整，我们调整的部分，slimScroll 的高度......
		$(window).resize(function() {
			// 触摸设备上立即重建
			if (isTouchDevice) {
				$.fn.fullpage.reBuild();
			} else {
				//要调用的函数，只有当调整完毕
				//http://stackoverflow.com/questions/4298612/jquery-how-to-call-resize-event-only-once-its-finished-resizing
				clearTimeout(resizeId);

				resizeId = setTimeout($.fn.fullpage.reBuild, 500);
			}
		});


		/**
		 * 当调整完毕后时，我们调整幻灯片大小和位置
		 */
		$.fn.fullpage.reBuild = function() {
			isResizing = true;

			var windowsWidth = $(window).width();
			windowsHeight = $(window).height();

			//文本和图像调整大小
			if (options.resize) {
				resizeMe(windowsHeight, windowsWidth);
			}

			$('.fp-section').each(function() {
				var scrollHeight = windowsHeight - parseInt($(this).css('padding-bottom')) - parseInt($(this).css('padding-top'));

				//调整表格的单元格的高度为 IE 和火狐浏览器
				if (options.verticalCentered) {
					$(this).find('.fp-tableCell').css('height', getTableHeight($(this)) + 'px');
				}

				$(this).css('height', windowsHeight + 'px');

				//调整大小的滚动 div
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

				//调整位置佛全宽幻灯片...
				var slides = $(this).find('.fp-slides');
				if (slides.length) {
					landscapeScroll(slides, slides.find('.fp-slide.active'));
				}
			});

			//调整当前节的位置
			var destinyPos = $('.fp-section.active').position();

			var activeSection = $('.fp-section.active');

			//是不是第一节吗？
			if (activeSection.index('.fp-section')) {
				scrollPage(activeSection);
			}

			isResizing = false;
			$.isFunction(options.afterResize) && options.afterResize.call(this);
		}

		/**
		 * 调整字体大小随窗口的大小，以及一些网站上的图像的大小。
		 */
		function resizeMe(displayHeight, displayWidth) {
			//标准高度，为其正文字体的大小是正确
			var preferredHeight = 825;
			var windowSize = displayHeight;

			/* 亟待解决的问题

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
		 * 激活网站导航点根据给定的幻灯片名称。
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
		 * 激活网站主菜单元素按照给定的幻灯片的名称。
		 */
		function activateMenuElement(name) {
			if (options.menu) {
				$(options.menu).find('.active').removeClass('active');
				$(options.menu).find('[data-menuanchor="' + name + '"]').addClass('active');
			}
		}

		/**
* 返回一个布尔值，根据可滚动元素是在结束了还是在滚动的起点
根据一项给定的类型。
*/
		function isScrolled(type, scrollable) {
			if (type === 'top') {
				return !scrollable.scrollTop();
			} else if (type === 'bottom') {
				return scrollable.scrollTop() + 1 + scrollable.innerHeight() >= scrollable[0].scrollHeight;
			}
		}

		/**
		 * Retuns '向上' 或者 '向下' 取决于到达其目的地的滚动运动
		 * 从当前节。
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
		 * Retuns '正确' 或 '左' 视滚动运动到达其目的地
		 * 从当前幻灯片开始。
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
			//需要做出 'scrollHeight' 在歌剧 12 下工作
			element.css('overflow', 'hidden');

			//在案例中的元素是一张幻灯片
			var section = element.closest('.fp-section');
			var scrollable = element.find('.fp-scrollable');

			//如果有滚动，contentHeight 将是可滚动一节中的一
			if (scrollable.length) {
				var contentHeight = scrollable.get(0).scrollHeight;
			} else {
				var contentHeight = element.get(0).scrollHeight;
				if (options.verticalCentered) {
					contentHeight = element.find('.fp-tableCell').get(0).scrollHeight;
				}
			}

			var scrollHeight = windowsHeight - parseInt(section.css('padding-bottom')) - parseInt(section.css('padding-top'));

			//需要滚动？
			if (contentHeight > scrollHeight) {
				//已经存在了滚动吗？更新它
				if (scrollable.length) {
					scrollable.css('height', scrollHeight + 'px').parent().css('height', scrollHeight + 'px');
				}
				//创建滚动
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

			//删除滚动时就没有必要了
			else {
				removeSlimScroll(element);
			}

			//撤消
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
		 * 向容器类有或没有根据动画 param 动画添加 css3 变换属性。
		 */
		function transformContainer(translate3d, animated) {
			container.toggleClass('fp-easing', animated);

			container.css(getTransforms(translate3d));
		}


		/**
		 * 滚动到给定的节和幻灯片
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


			//我们需要向下滚动到部分，然后到幻灯片
			if (destiny !== lastScrolledDestiny && !section.hasClass('active')) {
				scrollPage(section, function() {
					scrollSlider(section, slide)
				});
			}
			//如果我们已经在部分
			else {
				scrollSlider(section, slide);
			}
		}

		/**
		 * 滚动到给定节给定的幻灯片目的地滑块
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
		 * 创建具有水平滑块由点构成的景观导航栏。
		 */
		function addSlidesNavigation(section, numSlides) {
			section.append('<div class="fp-slidesNav"><ul></ul></div>');
			var nav = section.find('.fp-slidesNav');

			//顶部或底部
			nav.addClass(options.slidesNavPosition);

			for (var i = 0; i < numSlides; i++) {
				nav.find('ul').append('<li><a href="#"><span></span></a></li>');
			}

			//以它为中心
			nav.css('margin-left', '-' + (nav.width() / 2) + 'px');

			nav.find('li').first().find('a').addClass('active');
		}


		/**
		 * 设置图像的 URL 的幻灯片的一段哈希值
		 */
		function setURLHash(slideIndex, slideAnchor, anchorLink) {
			var sectionHash = '';

			if (options.anchors.length) {

				//是不是第一张幻灯片吗？
				if (slideIndex) {
					if (typeof anchorLink !== 'undefined') {
						sectionHash = anchorLink;
					}

					//无锚链接幻灯片吗？相反，我们采取索引。
					if (typeof slideAnchor === 'undefined') {
						slideAnchor = slideIndex;
					}

					lastScrolledSlide = slideAnchor;
					location.hash = sectionHash + '/' + slideAnchor;

					//第一张幻灯片不会有幻灯片锚，只是第一节
				} else if (typeof slideIndex !== 'undefined') {
					lastScrolledSlide = slideAnchor;
					location.hash = anchorLink;
				}

				//没有幻灯片节
				else {
					location.hash = anchorLink;
				}
			}
		}

		/**
		 * 滚动到给定节给定的幻灯片目的地滑块
		 */
		$(document).on('click', '.fp-slidesNav a', function(e) {
			e.preventDefault();
			var slides = $(this).closest('.fp-section').find('.fp-slides');
			var destiny = slides.find('.fp-slide').eq($(this).closest('li').index());

			landscapeScroll(slides, destiny);
		});


		/**
		 * 检查 translate3d 的支持
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

			// 将它添加到人体得到计算的风格。
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
		 * 移除自动滚动行动发射的鼠标滚轮和 tackpad。
		 * 调用此函数后，不会通过节滚动的鼠标滚轮和触控板的运动。
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
		 * 添加了自动滚动鼠标滚轮和 tackpad 的行动。
		 * 调用此函数后的鼠标滚轮和触控板的运动将会滚动节
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
		 * 自动滚动通过触摸设备上节中添加可能性。
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
		 * 删除自动滚动的触摸设备。
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
		 * 返回和 Microsoft 指针对象 （的 IE < 11 和 ie > = 11）
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
		 * 获取 pageX 和根据浏览器的 pageY 属性。
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
		 * 移除 fullpage.js 插件事件和 optinally，其 html 标记和样式
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

			//彻底移除
			if (all) {
				destroyStructure();
			}
		};

		/*
		 * 删除内联样式由 fullpage.js 添加
		 */
		function destroyStructure() {
			//重置 '顶' 或者 '翻译' 属性为 0
			silentScroll(0);

			$('#fp-nav, .fp-slidesNav, .fp-controlArrow').remove();

			//删除内联样式
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

			//删除添加的类
			$('.fp-section, .fp-slide').each(function() {
				removeSlimScroll($(this));
				$(this).removeClass('fp-table active');
			})

			container.find('.fp-easing').removeClass('fp-easing');

			//展开内容
			container.find('.fp-tableCell, .fp-slidesContainer, .fp-slides').each(function() {
				//解开不被使用万一有里面没有子元素，它只是文本
				$(this).replaceWith(this.childNodes);
			});

			//滚动到顶部与没有动画页
			$('html, body').scrollTop(0);

			//要知道是否这个插件已经在种情况下使用它在将来再次使用
			container.addClass('fullpage-used');
		}

	};

})(jQuery);