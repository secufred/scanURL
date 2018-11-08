const puppeteer = require('puppeteer');
const urlLib = require('url');

/*
This function extracts all the information we want from the website by using the puppeteer library.
Returns the extracted information in JSON format, if it fails at some point, it will return the error.
*/
exports.extractInfo = function(url, callback) {
  (async() => {
    var returnJSON = {};
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setRequestInterception(true);
    allRequests = []; // all requests made by the website
    allCertificates = []; // all certificates of the requests made by the website. We will extract the certificate to the domain we search for.
    certificate = {};

    page.on('request', (request) => {
      allRequests.push({ "url": request.url().trim(), "method": request.method() });
      request.continue();
    });

    page.on('response', async(resPage) => {
      if (resPage.securityDetails() != null) {
        allCertificates.push(resPage.securityDetails());
      }
    });

    // TO-DO: for the future work, we might also consider sharing a global puppeteer "page" instance
    // and also break down individiual services (screenshot, pagesource etc) in different try catch statements
    // In order to make sure that if one of them fails the others won't be affected.
    try {
      const response = await page.goto(url, {
        timeout: 3000000
      });
      const screenshot = await page.screenshot();

      const resp = await response.text(); //page source

      ip = response._request._response._remoteAddress.ip;
      const requests = response.request().redirectChain(); // the chain of redirection, in case of any

      redirectChain = [];
      for (i = 0; i < requests.length; i++) {
        redirectChain.push(requests[i].url());
      }

      //filter the certificates, search only for the website's certificate. We need to consider redirection to https as well.
      const domain = urlLib.parse(url).hostname;
      for (i = 0; i < allCertificates.length; i++) {
        if (allCertificates[i]._subjectName.indexOf(domain) > -1 || redirectChain.indexOf(allCertificates[i]._subjectName) > -1) {
          certificate = allCertificates[i];
          break;
        }
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

      await browser.close(); //regardless of the outcome, close the browser.
      callback(returnJSON, null);
    } catch (err) {
      callback(null, err);
    }
  })()
}
