/*
 * jQuery UI flyout menu 
 *   - written for jQuery UI 1.9 milestone 2 using the widget factory
 *
 * Copyright (c) 2010 Michael Lang, http://nexul.com/
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 */
(function($) {
	/* TODO: Someday use this
	$( ".menubar" ).menu({
		icons: { submenu: "ui-icon-triangle-1-s" },
		menus: "ul"
	});
	*/
}(jQuery));

(function($) {
$.widget("ui.menubar", {
	_create: function(){
		var self = this;
		this.element.children("button, a").next("ul").each(function(i, elm){
			$(elm).flyoutmenu({
				select: self.options.select,
				input: $(elm).prev()
			}).hide().addClass("ui-menu-flyout");
		});
		this.element.children("button, a").each(function(i, elm){
			
			$(elm).click(function(event) {
				$(document).find(".ui-menu-flyout").hide();
				if ($(this).next().is("ul")){
					/* This was data("flyoutmenu") but now we call directly */
					$(this).next().flyoutmenu("show");
					$(this).next().css({
						position:"absolute",
						top: 0,
						left: 0
					}).position({
						my: "left top",
						at: "left bottom",
						of: $(this),
						collision: "fit none" 
					});
				}
				event.stopPropagation();
			}).button({
				icons :{secondary: ($(elm).next("ul").length>0)? 'ui-icon-triangle-1-s':''}
			});
		});
	}
});
}(jQuery));

/*
 * jQuery UI flyout menu 
 *   - written for jQuery UI 1.9 milestone 2 using the widget factory
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * modified from: http://view.jqueryui.com/menu/tests/visual/menu/nested.html
 * 	by: Michael Lang, http://nexul.com/
 *
 */

(function($) {
$.widget("ui.flyoutmenu", {
	_create: function(){
		var self = this;
		this.active = this.element;
		this.activeItem = this.element.children("li").first();
		// hide submenus and create indicator icons
		this.element.find("ul").addClass("ui-menu-flyout").hide()
			.prev("a").prepend('<span class="ui-icon ui-icon-carat-1-e"></span>');
		
		this.element.find("ul").addBack().menu({
			// disable built-in key handling
			input: (!this.options.input)? $() : this.options.input,
			select: this.options.select,
			focus: function(event, ui) {
				self.active = ui.item.parent();
				self.activeItem = ui.item;
				ui.item.parent().find("ul").hide();
				var nested = $(">ul", ui.item);
				if (nested.length && /^mouse/.test(event.originalEvent.type)) {
					self._open(nested);
				}
			}
		}).keydown(function(event) {
			if (self.element.is(":hidden"))
				return;
			event.stopPropagation();
			switch (event.keyCode) {
			case $.ui.keyCode.PAGE_UP:
				self.pageup(event);
				break;
			case $.ui.keyCode.PAGE_DOWN:
				self.pagedown(event);
				break;
			case $.ui.keyCode.UP:
				self.up(event);
				break;
			case $.ui.keyCode.LEFT:
				self.left(event);
				break;
			case $.ui.keyCode.RIGHT:
				self.right(event);
				break;
			case $.ui.keyCode.DOWN:
				self.down(event);
				break;
			case $.ui.keyCode.ENTER:
			case $.ui.keyCode.TAB:
				self._select(event);
				event.preventDefault();
				break;
			case $.ui.keyCode.ESCAPE:
				self.hide();
				break;
			default:
				clearTimeout(self.filterTimer);
				var prev = self.previousFilter || "";
				var character = String.fromCharCode(event.keyCode);
				var skip = false;
				if (character == prev) {
					skip = true;
				} else {
					character = prev + character;
				}
				
				var match = self.activeItem.parent("ul").children("li").filter(function() {
					return new RegExp("^" + character, "i").test($("a", this).text());
				});
				var match = skip && match.index(self.active.next()) != -1 ? match.next() : match;
				if (!match.length) {
					character = String.fromCharCode(event.keyCode);
					match = self.widget().children("li").filter(function() {
						return new RegExp("^" + character, "i").test($(this).text());
					});
				}
				if (match.length) {
					self.activate(event, match);
					if (match.length > 1) {
						self.previousFilter = character;
						self.filterTimer = setTimeout(function() {
							delete self.previousFilter;
						}, 1000);
					} else {
						delete self.previousFilter;
					}
				} else {
					delete self.previousFilter;
				}
			}
		});
	},
	_open: function(submenu) {
		//only one menu can have items open at a time.
		$(document).find(".ui-menu-flyout").not(submenu.parents()).hide();
		submenu.show().css({
			top: 0,
			left: 0
		}).position({
			my: "left top",
			at: "right top",
			of: this.activeItem,
			collision: "fit none"
		});
		$(document).one("click", function() {
				//clicking outside menu flyouts should close all flyouts
				$(document).find(".ui-menu-flyout").hide();
		})
	},
	_select: function(event){
		this.activeItem.parent().data("menu").select(event);
		$(document).find(".ui-menu-flyout").hide();	
		activate(event, self.element.children("li").first());
	},
	left: function(event){
		this.activate(event, this.activeItem.parents("li").first());
	},
	right: function(event){
		this.activate(event, this.activeItem.children("ul").children("li").first());
	},
	up: function(event) {
		if (this.activeItem.prev("li").length > 0){
			this.activate(event, this.activeItem.prev("li"));
		}else{
			this.activate(event, this.activeItem.parent("ul").children("li:last"));
		}
	},
	down: function(event) {
		if (this.activeItem.next("li").length > 0){
			this.activate(event, this.activeItem.next("li"));
		}else{
			this.activate(event, this.activeItem.parent("ul").children("li:first"));
		}
	},
	pageup: function(event){
		if (this.activeItem.prev("li").length > 0){
			this.activate(event, this.activeItem.parent("ul").children("li:first"));
		}else{
			this.activate(event, this.activeItem.parent("ul").children("li:last"));
		}
	},
	pagedown: function(event){
		if (this.activeItem.next("li").length > 0){
			this.activate(event, this.activeItem.parent("ul").children("li:last"));
		}else{
			this.activate(event, this.activeItem.parent("ul").children("li:first"));
		}
	},
	activate: function(event, item){
		if (item){
			item.parent().data("menu").widget().show();
			item.parent().data("menu").activate(event, item);
		}
		this.activeItem = item;
		this.active = item.parent("ul");
	},
	show: function() {
		this.active = this.element;
		this.element.show();
		if (this.element.hasClass("ui-menu-flyout")){
			$(document).one("click", function() {
				//clicking outside menu flyouts should close all flyouts
				$(document).find(".ui-menu-flyout").hide();
			})
			this.element.one("mouseleave", function() {
				//clicking outside menu flyouts should close all flyouts
				$(document).find(".ui-menu-flyout").hide();
			})
		}
	},
	hide: function() {
		this.activeItem = this.element.children("li").first();
		this.element.find("ul").addBack().menu("deactivate").hide();
	}
});
}(jQuery));