const puppeteer = require('puppeteer');
var SiteInfo = require("../app/models/siteInfo");
const JSON = require('circular-json');
var IPToASN = require('ip-to-asn');
var client = new IPToASN();


module.exports = function(app) {
  app.post('/info', function(req, res, next) {
    const url = req.body.url;
    var r = /:\/\/(.[^/]+)/; // extracts the domain name from the url
    const domain = url.match(r)[1];
    var ip = "";
    var returnJSON = {};


    var p1 = new Promise(function(resolve, reject) {
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

        page.on('response', async(resPage) => {
          if (resPage.securityDetails() != null && !foundCertificate) {
            certificate = resPage.securityDetails();
            foundCertificate = true;
          }
        });

        try {
          const response = await page.goto(url)
          const screenshot = await page.screenshot();
          const resp = await response.text(); //page source

          ip = response._request._response._remoteAddress.ip;
          const requests = response.request().redirectChain(); // the chain of redirection, in case of any

          redirectChain = [];
          for (i = 0; i < requests.length; i++) {
            redirectChain.push(requests[i].url());
          }

          if ("_validFrom" in certificate && "_validTo" in certificate) {
            certificate["_validFrom"] = new Date(certificate["_validFrom"] * 1000).toLocaleDateString("en-US");
            certificate["_validTo"] = new Date(certificate["_validTo"] * 1000).toLocaleDateString("en-US");
          }

          source = "";
          destination = "";
          if (requests.length > 0) {
            source = requests[0].url().toString();
            destination = requests[requests.length - 1].url().toString();
          }

          returnJSON = {
            "resp": resp.toString(),
            "ss": screenshot.toString('base64'),
            "ip": ip,
            "allRequests": allRequests,
            "redirectChain": redirectChain,
            "sourceDestination": {
              "source": source,
              "destination": destination
            },
            "certificate": certificate
          };

          siteInfo = new SiteInfo({
            img: { data: screenshot, contentType: 'image/png' },
            url: url,
            ip: ip,
            source: source,
            destination: destination
          });
          siteInfo.save(); //save the information to the db.
          await browser.close(); //regardless of the outcome, close the browser.
          resolve({ "ip": ip });
        } catch (err) {
          res.status(400).send(JSON.stringify(err));
          resolve(err);
        }
      })()
    });

    p1.then(function(extractionResult) {
      //IPToASN library requires the input to be of type array, takes ip as the input from the first call.
      if ("ip" in extractionResult) {
        client.query([ip], function(err, results) {
          if (err) {
            console.error(err);
          } else {
            returnJSON["ASN"] = results[ip];
          }
          res.status(200).send(JSON.stringify(returnJSON));
        });
      }
    })
  });

  // frontend routes =========================================================
  // route to handle all angular requests
  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });



};
