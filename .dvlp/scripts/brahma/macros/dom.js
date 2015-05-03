Brahma.macros.dom = {};

/* 
Проверяет subject HTMLElement на соответствие псевдоuqery 
:visible проверка на видимости элемента (не проверяет фактор видимости в зависимости от расположения элемента )
:seeable временно не поддержвается!!!
*/
Brahma.macros.dom.pseusoQueryMatch = function(subject,pqs) {
	switch(pqs) {
		case 'visible':
			return  (function(cstyle) {
				return !(cstyle.display==="none" || cstyle.visibility==="hidden" || parseInt(cstyle.opacity)===0);
			})(window.getComputedStyle(subject));
		break;

	}
};

/*
Возвращает margin элемента в пикселях, даже если оно указано в процентах.
*/
Brahma.macros.dom.pixelizeMargin = function(subject, direction) {
	direction=direction.toLowerCase();

	var ml = window.getComputedStyle(subject)['margin'+String(direction.charAt(0)).toUpperCase()+direction.substr(1)];
	return Brahma.pixelize(ml, (direction==='left'||direction==='right')?subject.parentNode.clientWidth:subject.parentNode.clientHeight);
};