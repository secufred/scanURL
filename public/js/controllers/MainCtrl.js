angular.module('MainCtrl', []).controller('MainController', function($scope, $http, config) {

  $scope.submit = function() {
    url = $scope.inputUrl;
    $scope.showSpinner = true;
    var prefix = 'http';
    
    if (url.indexOf(prefix) == -1)
    {
        url = prefix + '://' + url;
    }


    data = JSON.stringify({ url: url })

    $http({
      url: config.baseUrl + 'info',
      method: 'POST',
      data: data
    }).then(function successCallback(response) {
      $scope.disp_error = false;
      $scope.found = true;
      $scope.pageSource = response.data.resp;
      $scope.ip = response.data.ip;
      $scope.ss = response.data.ss;
      $scope.allRequests = response.data.allRequests;
      $scope.sourceDestination = response.data.sourceDestination;
      $scope.redirectChain = response.data.redirectChain;
      $scope.certificate = response.data.certificate;
      $scope.ASN = response.data.ASN;
      $scope.showSpinner = false;
    }, function errorCallback(response) {
      $scope.disp_error = true;
      $scope.found = false;
      $scope.showSpinner = false;
    });
  };

});
