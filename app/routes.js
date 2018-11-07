const puppeteer = require('puppeteer');
var SiteInfo = require("../app/models/siteInfo");
const JSON = require('circular-json');


module.exports = function(app) {

  app.post('/info', function(req, res, next) {
    const url = req.body.url;
    var r = /:\/\/(.[^/]+)/; // extracts the domain name from the url
    const domain = url.match(r)[1];

    (async() => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setRequestInterception(true);
      allRequests = []; // all requests made by the website
      certificate = {}; // all certificates of the requests made by the website, needs to be filtered with the domain name we search for.
      foundCertificate = false; // serves as breaking from listening the responses. If certificate matching with the domain name has already been found, then we can stop listening for the requests.

      page.on('request', (request) => {
        allRequests.push({ "url": request.url().trim(), "method": request.method() });
        request.continue();
      });

      page.on('response', async(res) => {
        if (res.securityDetails() != null && !foundCertificate) {
            certificate = res.securityDetails();
            foundCertificate = true;
        }
      });

      try {
        const response = await page.goto(url)
        const screenshot = await page.screenshot();
        const resp = await response.text();

        const ip = response._request._response._remoteAddress.ip;
        const requests = response.request().redirectChain();

        redirectChain = [];
        for (i = 0; i < requests.length; i++) {
          redirectChain.push(requests[i].url());
        }

        if( "_validFrom" in certificate && "_validTo" in certificate) {
              certificate["_validFrom"] = new Date(certificate["_validFrom"] * 1000).toLocaleDateString("en-US");
              certificate["_validTo"] = new Date(certificate["_validTo"] * 1000).toLocaleDateString("en-US");
          }

        const returnJSON = {
          "resp": resp.toString(),
          "ss": screenshot.toString('base64'),
          "ip": ip,
          "allRequests": allRequests,
          "redirectChain": redirectChain,
          "sourceDestination": {
            "source": requests.length > 0 ? requests[0].url().toString() : "",
            "destination": requests.length > 0 ? requests[requests.length - 1].url().toString() : ""
          },
          "certificate": certificate
        };

        res.status(200).send(JSON.stringify(returnJSON))
        siteInfo = new SiteInfo({ img: { data: screenshot, contentType: 'image/png' }, url: url, ip: ip });
        siteInfo.save();
      } catch (err) {
        console.log(err)
        res.status(404).send(err);
      }

      await browser.close();
    })();
  });


  // frontend routes =========================================================
  // route to handle all angular requests
  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });



};
