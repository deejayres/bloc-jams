var animatePoints = function() {
	var points = document.getElementsByClassName('point');
	
	var revealPoint = function (idx) {
		points[idx].style.opacity = 1;
		points[idx].style.transform = "scaleX(1) translateY(0)";
		points[idx].style.msTransform = "scaleX(1) translateY(0)";
		points[idx].style.WebkitTransform = "scaleX(1) translateY(0)";
	};
	
	for (var i = 0; i < points.length; i++) {
		revealPoint(i);
	};	
};