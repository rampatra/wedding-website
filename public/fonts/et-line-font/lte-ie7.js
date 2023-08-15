/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'et-line\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-mobile' : '&#xe000;',
			'icon-laptop' : '&#xe001;',
			'icon-desktop' : '&#xe002;',
			'icon-tablet' : '&#xe003;',
			'icon-phone' : '&#xe004;',
			'icon-document' : '&#xe005;',
			'icon-documents' : '&#xe006;',
			'icon-search' : '&#xe007;',
			'icon-clipboard' : '&#xe008;',
			'icon-newspaper' : '&#xe009;',
			'icon-notebook' : '&#xe00a;',
			'icon-book-open' : '&#xe00b;',
			'icon-browser' : '&#xe00c;',
			'icon-calendar' : '&#xe00d;',
			'icon-presentation' : '&#xe00e;',
			'icon-picture' : '&#xe00f;',
			'icon-pictures' : '&#xe010;',
			'icon-video' : '&#xe011;',
			'icon-camera' : '&#xe012;',
			'icon-printer' : '&#xe013;',
			'icon-toolbox' : '&#xe014;',
			'icon-briefcase' : '&#xe015;',
			'icon-wallet' : '&#xe016;',
			'icon-gift' : '&#xe017;',
			'icon-bargraph' : '&#xe018;',
			'icon-grid' : '&#xe019;',
			'icon-expand' : '&#xe01a;',
			'icon-focus' : '&#xe01b;',
			'icon-edit' : '&#xe01c;',
			'icon-adjustments' : '&#xe01d;',
			'icon-ribbon' : '&#xe01e;',
			'icon-hourglass' : '&#xe01f;',
			'icon-lock' : '&#xe020;',
			'icon-megaphone' : '&#xe021;',
			'icon-shield' : '&#xe022;',
			'icon-trophy' : '&#xe023;',
			'icon-flag' : '&#xe024;',
			'icon-map' : '&#xe025;',
			'icon-puzzle' : '&#xe026;',
			'icon-basket' : '&#xe027;',
			'icon-envelope' : '&#xe028;',
			'icon-streetsign' : '&#xe029;',
			'icon-telescope' : '&#xe02a;',
			'icon-gears' : '&#xe02b;',
			'icon-key' : '&#xe02c;',
			'icon-paperclip' : '&#xe02d;',
			'icon-attachment' : '&#xe02e;',
			'icon-pricetags' : '&#xe02f;',
			'icon-lightbulb' : '&#xe030;',
			'icon-layers' : '&#xe031;',
			'icon-pencil' : '&#xe032;',
			'icon-tools' : '&#xe033;',
			'icon-tools-2' : '&#xe034;',
			'icon-scissors' : '&#xe035;',
			'icon-paintbrush' : '&#xe036;',
			'icon-magnifying-glass' : '&#xe037;',
			'icon-circle-compass' : '&#xe038;',
			'icon-linegraph' : '&#xe039;',
			'icon-mic' : '&#xe03a;',
			'icon-strategy' : '&#xe03b;',
			'icon-beaker' : '&#xe03c;',
			'icon-caution' : '&#xe03d;',
			'icon-recycle' : '&#xe03e;',
			'icon-anchor' : '&#xe03f;',
			'icon-profile-male' : '&#xe040;',
			'icon-profile-female' : '&#xe041;',
			'icon-bike' : '&#xe042;',
			'icon-wine' : '&#xe043;',
			'icon-hotairballoon' : '&#xe044;',
			'icon-globe' : '&#xe045;',
			'icon-genius' : '&#xe046;',
			'icon-map-pin' : '&#xe047;',
			'icon-dial' : '&#xe048;',
			'icon-chat' : '&#xe049;',
			'icon-heart' : '&#xe04a;',
			'icon-cloud' : '&#xe04b;',
			'icon-upload' : '&#xe04c;',
			'icon-download' : '&#xe04d;',
			'icon-target' : '&#xe04e;',
			'icon-hazardous' : '&#xe04f;',
			'icon-piechart' : '&#xe050;',
			'icon-speedometer' : '&#xe051;',
			'icon-global' : '&#xe052;',
			'icon-compass' : '&#xe053;',
			'icon-lifesaver' : '&#xe054;',
			'icon-clock' : '&#xe055;',
			'icon-aperture' : '&#xe056;',
			'icon-quote' : '&#xe057;',
			'icon-scope' : '&#xe058;',
			'icon-alarmclock' : '&#xe059;',
			'icon-refresh' : '&#xe05a;',
			'icon-happy' : '&#xe05b;',
			'icon-sad' : '&#xe05c;',
			'icon-facebook' : '&#xe05d;',
			'icon-twitter' : '&#xe05e;',
			'icon-googleplus' : '&#xe05f;',
			'icon-rss' : '&#xe060;',
			'icon-tumblr' : '&#xe061;',
			'icon-linkedin' : '&#xe062;',
			'icon-dribbble' : '&#xe063;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};