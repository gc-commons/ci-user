'use strict';

describe('Service :: User', function(){
  var service, http, $httpBackend;


  beforeEach(module('ci_user', function($provide) {
  }));

  beforeEach(inject(function(_httpSrv_, _$httpBackend_, _userSrv_) {
    http = _httpSrv_;
    service = _userSrv_;
    $httpBackend = _$httpBackend_;
  }));

  beforeEach(function() {
    $httpBackend.whenGET(/.*\/main\.html.*/).respond('<div></div>');
    $httpBackend.whenGET('/dummyGET/true').respond({ get: true });
    $httpBackend.whenPOST('/dummyPOST/true').respond({ post: true });
    $httpBackend.whenGET(/.*UserAccount\/userName.*/).respond({});
    $httpBackend.whenGET(/.*config.json.*/).respond({
      "flexITP": {
        "tradingApiURL" : "https://ciapiqat.cityindextest9.co.uk/tradingapi/"
      }
    });
  });

  it(':: getUserData :: Success',function(){
    $httpBackend.whenGET(/.*UserAccount\/ClientAndTradingAccount.*/).respond({});
    var user;
    service.getUserData().then(function(_user){
      user = _user;
    });
    $httpBackend.flush();
    expect(user).toEqual({});
  });

  it(':: getUserData :: Cached',function(done){
    $httpBackend.whenGET(/.*UserAccount\/ClientAndTradingAccount.*/).respond({'call': 'first'});
    var user;
    service.getUserData().then(function(_user){
      user = _user;
      $httpBackend.whenGET(/.*UserAccount\/ClientAndTradingAccount.*/).respond({'call': 'second'});
      service.getUserData().then(function(_user){
        user = _user;
        expect(user.call).toBe('first');
        done();
      });
    });
    $httpBackend.flush();
  });

  it(':: getUserData :: Error',function(done){
    $httpBackend.whenGET(/.*UserAccount\/ClientAndTradingAccount.*/).respond(401,'');
    var user;
    service.getUserData().then(function(){},function(){
      done();
    });
    $httpBackend.flush();
  });

  var newName = 'test';
  it('::SessionParams :: initSessionParameter ', function () {
    service.initSessionParameter();
    expect(service.params.UserName).toBe('');
  });

  it(':: SessionParams :: setSessionParameter ', function () {
    service.setSessionParameter({'UserName': newName});
    expect(service.params.UserName).toBe(newName);
  });

  it(':: SessionParams :: getSessionParameter ', function () {
    service.setSessionParameter({'UserName': newName});
    var test = service.getSessionParameter();
    expect(test.UserName).toBe(newName);
  });

  it(':: updatePassword :: Success',function(){
    var requestBody;
    $httpBackend.whenPOST(/.*session\/changePassword.*/).respond(function(method, url, data){
      requestBody = JSON.parse(data);
      expect(requestBody.hasOwnProperty('NewPassword'));
      expect(requestBody.NewPassword).toBe(newPass);
      expect(requestBody.hasOwnProperty('Password'));
      expect(requestBody.Password).toBe(oldPass);
      return {};
    });
    var newPass = 'a',
      oldPass = 'b';
    service.updatePassword(oldPass,newPass).then(function() { });
    $httpBackend.flush();
  })

  it(':: updateEmail :: Success',function(){
    var requestBody;
    $httpBackend.whenPOST(/.*UserAccount\/save.*/).respond(function(method, url, data, headers ){
      requestBody = JSON.parse(data);
      expect(requestBody.hasOwnProperty('personalEmailAddress'));
      expect(requestBody.personalEmailAddress).toBe(newMail);
      expect(requestBody.hasOwnProperty('personalEmailAddressIsDirty'));
      expect(requestBody.personalEmailAddressIsDirty).toBe(true);
      return {};
    });
    var newMail = 'a@b.com';
    service.updateEmail(newMail).then(function(){ });
    $httpBackend.flush();
  })

});
