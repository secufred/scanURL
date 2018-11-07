angular.module('MainCtrl', []).controller('MainController', function($scope, $http, config) {

  $scope.submit = function() {
    url = $scope.inputUrl;

    var prefix = 'http://';
    if (url.substr(0, prefix.length) !== prefix)
    {
        url = prefix + url;
    }


    data = JSON.stringify({ url: url })

    //TO-DO: move this to the WebInfoService
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
    }, function errorCallback(response) {
      $scope.disp_error = true;
    });
  };

});
