;(function($, window, document, undefined) {

	"use strict";

	/**
	 *	Count variable to check how many time we are in the loop /	
	 *  how many selectors has instances of the LanguageChooser Object.
	 *
	 */
	var count = 1;

	/**
	 *	We store our languages collection.	
	 *  
	 */
	var languages = [];

	/**
	 *	We set all our methoods and properties inside 
	 *  a LanguageChooser Object.	
	 *
	 */	
	var LanguageChooser = {

		/**
		 *	Set property so we can reffer to our Language Chooser Element at any time.
		 *
		 */	
		languageChooser: {},

		/**
		 *	We initialize the object with this init method
		 *  if the user called the plugin without selector / $.LanguageChooser().
		 *	
		 */
		init: function(options, element) {

			var self = this;

			self.settings = $.extend({}, $.fn.LanguageChooser.settings, options);

			languages = self.settings.languages;
			
			if(element !== undefined) {
			// we check if the user called this init method with prepended selector
				self.settings.class = self.settings.id = $(element).attr('class').split(' ')[0] || 
														 $(element).attr('id').split(' ')[0];
			}

			if(self.settings.setSelector !== '') {
			// we let the users to set their own element-selector-name
				self.settings.class = self.settings.id = self.settings.setSelector;
			}
			
			if(($('.' + self.settings.class).length || $('#' + self.settings.id).length)) {
			// we look for an element-selector-name that match our settings	
				
				self.languageChooser = ($('.' + this.settings.class).length) ? 
										$('.' + this.settings.class) : ('#' + this.settings.id);

				self.settings.position = self.settings.position || 'absolute';
					
				if(self.settings.relativeTo !== '') {
					
					var parentElement = $(self.settings.relativeTo);
				} else {

					var parentElement = self.languageChooser.closest('div');
				}
				
				self.setLanguages(languages)
					.positioning(self.settings)
					.attachTo(parentElement);

				self.languageChooser.find('li:first-child').on('click', self.changeVisibility );
				
			} else {
			// otherwise we create a fixed element to the top right corner of the screen
				self.languageChooser = self.createElement();
				
				self.settings.position = self.settings.position || 'fixed';

				self.setLanguages(languages)
					.positioning(self.settings)
					.attachTo(); // by default attaching to body

				self.languageChooser.on('click', this.changeVisibility );
			}

			// We call our generalStyle method to style all the elements in one place.
			self.generalStyle(self.languageChooser);
			
			// We hide initially the language bar.
			self.languageChooser.find('li:not(:first-child)').hide();

			// We call the methood that sets the cookie on click.
			self.languageChooser.find('li:not(:first-child)').on('click', self.setTheCookie);

			count++;
		},


		/**
		 *	Creating the Language Chooser Element if the 
		 *  user did not specify any selector or if the default
		 *	language-chooser selector name is not located in the DOM.
		 *	
		 */
		createElement: function() {

			return $('<div />', {
				'class': this.settings.setSelector || this.settings.class || 'language-chooser',
			}).css({
				'position': 'fixed',
			});
		},

		/**
		 *	Adding the languages that the user want to be
		 *  as an option in the Language Chooser Menu.
		 *	
		 */
		setLanguages: function(collection) {
			
			var self = this,
				cssBackgroundImageProperty = '',
				languagesListItems = [],
				flagsFolder = self.formatFolderPath(self.settings.flagsFolder),
				extention = self.settings.extention || 'png';	
				
			if(self.isArray(collection)) {
				
				$(collection).each(function(index, value) {
					
					var flagIconFileName = value.fileName || value,
						sessionKey = value.sessionKey || value,
						altProperty = value.alt || value;
					
					if(self.folderIconPathIsSet()) {

						cssBackgroundImageProperty = 'url(' + flagsFolder + '/' + flagIconFileName + '.' + extention + ')';
					
					} else {

						cssBackgroundImageProperty = 'url(https://cdn2.iconfinder.com/data/icons/flags_gosquared/64/'+ flagIconFileName + '_flat.png)';
					}

					languagesListItems[index] = $('<li />', {
						'class': flagIconFileName,
						'data-session-key': sessionKey,
					}).css({
						'background-image': cssBackgroundImageProperty,	
					});

					if(self.settings.withLabel)
					{
						var span = $('<span />', {
								text: altProperty,
							});

						languagesListItems[index].html(span);
					}	
				});
			}

			$(languagesListItems).each(function(index, value) {

				var cookie = $(value).data('session-key'); 

				if(self.getCookie('lang') !== "" && self.getCookie('lang') === cookie) {
				
					var activeLang = languagesListItems[index];

					languagesListItems.splice(index, 1);

					languagesListItems.unshift(activeLang);	
				
				}
			});
			
			
			
			
			var ul = $('<ul />', {
				'class': 'slideToggle',
			});
			
			ul.html(languagesListItems);

			self.languageChooser.html(ul);

			self.languageChooser.find('li').on('mouseover', function() {
				$(this).children('span').show();

				$(this).on('mouseout', function() {

					$(this).children('span').hide();
				});
			});
			
			return this;
		},

		/**
		 *	Positioning the Language Chooser on the choosen
		 *  place in the DOM.
		 *	
		 */
		positioning: function(settings) {

			switch(settings.position) {
				case 'fixed':
					this.languageChooser.css({
						'position': 'fixed',
						'left': settings.direction.left || 'auto',
						'right': settings.direction.right || 'auto',
						'top': settings.direction.top || 'auto',
						'bottom': settings.direction.bottom || 'auto',
					});
				break;
				case 'absolute':	
					this.languageChooser.css({
						'position': 'absolute',
						'left': settings.direction.left || 'auto',
						'right': settings.direction.right || 'auto',
						'top': settings.direction.top || 'auto',
						'bottom': settings.direction.bottom || 'auto',
					});
				break;	
				default:
					
				break;
			}

			this.languageChooser.find('li:not(:first-child)').css('margin-top', '2px');

			return this;
		},

		/**
		 *	Prepend the Language Chooser to the body by default
		 *  or to where the user set on the settings.
		 *	
		 */
		attachTo: function(element) {
			var relativeElement = 'body';

			if(element !== undefined)
				relativeElement = element;

			$(this.settings.prependTo || relativeElement).prepend(this.languageChooser);
			return this;
		},

		/**
		 *	Allow us to toggle the visiblity of the
		 *  Language Chooser.
		 *	
		 */	
		changeVisibility: function() {
			
			$(this).find('li:not(:first-child)').slideToggle();	
		},

		/**
		 *	We style our Language Chooser.
		 *  
		 */
		generalStyle: function(element) {

			element.css({
				'z-index': '99',
				'cursor': 'pointer',
				'margin': '0px',
				'padding': '0px',
				'height': '35px',
				'width': '42px'
			}).children('ul').css({
				'padding': '0',
				'margin': '0'
			}).children('li').css({
				'position': 'relative',
				'list-style-type': 'none',
				'height': '33px',
				'width': '40px',
				'background-position': 'center center',
				'background-size': '40px 48px',
				'repeat': 'no-repeat',
				'padding': '0',
				'border': '1px solid black',
			});

			if(element.find('span').length) {
				
				element.find('span').css({
					'font-size': '10px',
					'display': 'block',
					'background-color': 'RGBA(0, 0, 0, 0.8)',
					'color': '#ffffff',
					'display': 'none',
					'position': 'absolute',
					'right': '-15px',
					'top': '-10px',
					'z-index': '3',
					'border-radius': '30% 30%',
				}).first().text('');
			}

			if(this.settings.horizontal) {

				element.children('ul').css({
					'width': '300px'
				}).children('li:not(:first-child)').css({
					'margin-left': '15px',
					'display': 'block',
				});

				element.find('li').css({
					'float': 'left',
				});
			
			} else {

				element.find('li:not(:first-child)').css({
					'margin-top': '10px',
					'display': 'block',
				});
			}
		},

		/**
		 *	Just to make sure we get the folder path 
		 * 	as we expected.
		 *  
		 */
		formatFolderPath: function(path) {

			return (path.substr(path.length - 1) == '/' ) ? 
								path.slice(0,-1) : path;
		},

		/**
		 *	We check if the user gave any path
		 *  for his own flags icons. 
		 * 	
		 */
		folderIconPathIsSet: function() {

			return (this.settings.flagsFolder) ? this.settings.flagsFolder : false;
		},

		/**
		 *	We set the session with the choosen session
		 *  key in the cookie.
		 * 	
		 */
		setTheCookie: function(event) {
			
			event.preventDefault();
			
			var sessionKey = $(this).data('session-key');
			
			document.cookie = "lang=" + sessionKey;

			location.reload();
		},

		/**
		 *	Helper function to check if we are dealing
		 *  with object only.
		 * 	
		 */
		isObject: function(collection) {

			return (collection instanceof Object && !Array.isArray(collection)) ? collection : false;
		},

		/**
		 *	Helper function to check if we are dealing
		 *  with array only.
		 * 	
		 */
		isArray: function(collection) {

			return (collection instanceof Array && Array.isArray(collection)) ? collection : false;
		},
		getCookie: function(cname) {
		    
		    var name = cname + "=";
		    var ca = document.cookie.split(';');
		    for(var i = 0; i < ca.length; i++) {
		        var c = ca[i];
		        while (c.charAt(0) == ' ') {
		            c = c.substring(1);
		        }
		        if (c.indexOf(name) == 0) {
		            return c.substring(name.length, c.length);
		        }
		    }
		    return "";
		},
	};
	
	/**
	 *	We allow the users to call that plugin 
	 *  without neseccerly using a selector.
	 *	
	 */	
	$.LanguageChooser = function(options) {
		
		var languageChooser = Object.create(LanguageChooser);

		return $(languageChooser).each(function(index, value) {
			
			languageChooser.init(options);
		});
	};

	/**
	 *	If they do wants to use a selector we are
	 *  not going to prevent that.
	 *
	 */
	$.fn.LanguageChooser = function(options) {
		
		return this.each(function(index, value) {
			
			var languageChooser = Object.create(LanguageChooser);
				languageChooser.init(options, value);
		});
	};

	/**
	 *	We store the default settings we wants 
	 *  the language chooser to look like.
	 *
	 */
	$.fn.LanguageChooser.settings = {
		'class': 'language-chooser',
		'id': 'language-chooser',
		'setSelector': '',
		'prependTo': '',
		'position': '',
		'direction': {
			'right': '', 
			'left': '', 
			'top': '',
			'bottom': ''
		},
		'languages': ['de', 'en', 'fr'],
		'flagsFolder': '',
		'extention': '',
		'horizontal': false,
		'relativeTo': '',
		'withLabel': false,
	};

})(jQuery, window, document);