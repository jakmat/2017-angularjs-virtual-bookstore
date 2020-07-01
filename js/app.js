angular.module('bookStore', [])
.controller('BookStoreController', ['$scope', '$rootScope', '$timeout', function ($scope, $rootScope, $timeout) {
	$scope.categories = [];	
	$scope.books = [];	
	$scope.filteredBooks = [];
	$scope.loading = true;
	$scope.category = 0;
	$scope.searchText = '';
	$scope.getCategories = new Promise((resolve, reject) => {
		$timeout(function () {
			resolve(categoriesData);							
		}, 2  * 1000);	
	});	
	$scope.getBooks = new Promise((resolve, reject) => {
		$timeout(function () {
			resolve(booksData);							
		}, 2  * 1000);		
	});	
	
	$scope.bookFilter = function (item) {
		// data wydania książki
		var date1 = new Date(item.release.substr(6, 4), item.release.substr(3, 2) - 1, item.release.substr(0, 2));
		// aktualna data
		var date2 = new Date();
		// różnica dat
		var timeDiff = Math.abs(date2.getTime() - date1.getTime());
		var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
		
		// filtr 1. - kategoria
		switch($scope.category) {
			// nowości
			case -2:
				if (date1 < date2  || diffDays > 14) {
					return false;
				}
				
				break;
			// zapowiedzi
			case -1:				
				if (date1 > date2 || diffDays > 14) {
					return false;
				}
				
				break;
			// wszystkie
			case 0:
				break;
			// pozostałe kategorie: Audiobooki, Ebooki, Super Okazje (dynamicznie, ze struktury danych)
			default:
				if (item.categories.indexOf($scope.category) < 0) {
					return false;
				}
				
				break;
		}
	
		// filtr 2. - wyszukiwanie po stringu nazwa/autor, uniewrażliwienie wyszukiwarki na wielkość liter
		if ($scope.searchText != '' && (item.title.toUpperCase().indexOf($scope.searchText.toUpperCase()) < 0 && item.author.toUpperCase().indexOf($scope.searchText.toUpperCase()) < 0)) {					
			return false; 
		}		

		return true;
	};		
	
	// pobranie wartości z inputu wyszukiwarki
	$scope.bookSearch = function () {
		$scope.searchText = $('#bookSearchInput').val();
	};	
	
	// przypisanie wartości id do kategorii
	$scope.setCategory = function (id) {
		$scope.category = id;
	};		
	
	// jeśli kategoria odpowiada id zakładki, zakładka aktywna
	$scope.getCategoryClass = function (id) {
		return $scope.category == id ? 'active' : '';
	};	
		
	// przypisz dane do kategorii po ich pobraniu
	$scope.getCategories.then((data) => {	
		$scope.$apply(function () { 
			$scope.categories = data;
		});
	});
	
	// zamknij pasek ładowania po pobraniu danych
	$scope.getBooks.then((data) => {	
		$scope.$apply(function () { 
			$scope.books = data; 
			$scope.loading = false; 
		});
	});
	
	// jeśli nie ładuje danych oraz wynik wyszukiwania zerowy, wywołaj modal i poinformuj usera
	$scope.$watch('filteredBooks', function(filteredBooks) {		
		if (!$scope.loading && filteredBooks.length <= 0) {
			$("#searchUnsuccessful").modal('show');
		}
		
	});
}])

.controller('CartController', ['$scope', '$rootScope', function ($scope, $rootScope) {
	$scope.items = [];
	$scope.newItem = null;
	$scope.newItemCount = 0;
	$scope.newItemCountTotal = 0;
	$scope.media = mediaData;
	
	// wywołaj okno dodania do koszyka po kliknięciu przycisku
	$scope.addToCart = function (book) {			
		$scope.newItem = book;
		$("#itemModal").modal('show');
	};	
	
	// dodaj książki do koszyka
	$scope.addItem = function () {		
		$scope.items.push({ 
			'book': $scope.newItem.title,
			'qty': $scope.newItem.qty,
			'medium': $scope.newItem.medium
		});
		
		// zatwierdź dodanie do koszyka
		$scope.newItemCount = 1;
		$scope.newItemCountTotal += $scope.newItemCount * $scope.newItem.qty;
		$("#itemModal").modal('hide');
		$scope.newItemCount = 0;
		$scope.newItem.medium = null;		
		$scope.newItem.qty = null;
		$scope.itemModalForm.$setPristine();
		$scope.itemModalForm.qty.$setUntouched();
		$scope.itemModalForm.medium.name.$setUntouched();
	};	
	
	// anuluj dodanie do koszyka
	$scope.dismissItem = function () {
		$scope.newItem.medium = null;		
		$scope.newItem.qty = null;
		$scope.itemModalForm.$setPristine();
		$scope.itemModalForm.qty.$setUntouched();
		$scope.itemModalForm.medium.name.$setUntouched();
	};
	
	// wyświetl zawartość koszyka
	$scope.checkCart = function () {
		$("#checkModal").modal('show');		
	};
	
	// przekaż dane między zasięgami obu kontrolerów
	$rootScope.$on('AddToCart', function (event, book) {
		$scope.addToCart(book);		
    }); 	 
}]);