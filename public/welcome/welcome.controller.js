app.controller('WelcomeController', ['$scope', function($scope) {
	/************************************************/
	/* Constructor - Init							*/
	/************************************************/
	
	
	
	/************************************************/
	/* Functions - Data								*/
	/************************************************/
	$scope.quicklinks = [
		{
			title: 'Also, you can use a quick link:',
			list: splitArray([
				{ label: 'Accounts', ids: '6-7' },
				{ label: 'Phases', ids: '10-11' },
				{ label: 'Matmul', ids: '2-3' },
				{ label: 'Bad cache', ids: '6' },
				{ label: 'Mandelbrot', ids: '13' },
				{ label: 'N Queens', ids: '14' },
			], 3)
		}, {
			title: 'Compare parallel and serial implementations:',
			list: splitArray([
				{ label: 'Merge & Sort', ids: '9-8' },
				{ label: 'Particules', ids: '5-4' },
			], 2)
		}, {
			title: 'Explore dining philosophers problem:',
			icon: 'fa-cutlery',
			showEmphasis: true,
			showHardDiff: true,
			list: splitArray([
				{ label: '5', ids: '21' },
				{ label: '6', ids: '1006' },
				{ label: '12', ids: '1012' },
				{ label: '45', ids: '22' },
				{ label: '5 vs. 6 ᵜ', ids: '21-1006' },
				{ label: '5 vs. 45', ids: '21-22' },
				{ label: '6 vs. 45', ids: '1006-1045' },
				{ label: '45 vs. 45 ᵜ', ids: '22-1045' },
			], 4)
		}, {
			title: 'And classic producers / consumers:',
			list: splitArray([
				{ label: '1/1 vs. 100/100', ids: '31-39' },
				{ label: '1/1 vs. 10/10', ids: '31-35' },
				{ label: '10/10 vs. 100/100', ids: '35-39' },
				{ label: '1/10 vs. 10/1', ids: '32-34' },
				{ label: '1/100 vs. 100/1', ids: '33-37' },
				{ label: '10/100 vs. 100/10', ids: '36-38' },
			], 3)
		}
	]
	$scope.experiments = [
		{ label: 'test', url: '/xp/#/xp/99' },
	]
	
	
	
	/************************************************/
	/* Functions - UI								*/
	/************************************************/
	function splitArray(list, count) {
		var splitted = new Array();
		
		list.forEach(function(element, index) {
			if (index % count == 0) {
				splitted.push([element]);
			} else {
				splitted[splitted.length - 1].push(element);
			}
		});
		
		return splitted;
	}
	
	
	/************************************************/
	/* Constructor - Finish							*/
	/************************************************/
}]);