const express = require('express')
const puppeteer = require('puppeteer');
const cors= require('cors')
const bodyParser = require('body-parser');
const fs = require('fs')
var app = express();

var timeout = require('connect-timeout')

function delay(time) {
   return new Promise(function(resolve) { 
       setTimeout(resolve, time)
   });
}

app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Credentials", "true");
    res.header('Access-Control-Allow-Methods',
    'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type, X-Codingpedia, Authorization');
    next();
});

app.get("/gerarRelatorioIndicadores", async (req, res) => {
    
    var dataInicio = new Date().toLocaleDateString('en-GB')
    var dataInicioArray = dataInicio.split('-')
    var horaInicio = new Date().toLocaleTimeString()
    var currentHost = req.query.currentHost
    
    console.log("======================================================================")
    // console.log(`Iniciou às: ${dataInicioArray[2]}/${dataInicioArray[1]}/${dataInicioArray[0]} - ${horaInicio}`);
    console.log(`Iniciou às: ${dataInicio} - ${horaInicio}`);
    const browser = await puppeteer.launch({
        headless: true,
        // executablePath:'./node_modules/puppeteer/.local-chromium/linux-599821/chrome-linux/chrome',
        executablePath:'./node_modules/puppeteer/.local-chromium/win64-706915/chrome-win/chrome',
        ignoreDefaultArgs: ['--disable-extensions'], 
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // console.log("PHPSESSID: ", req.query.phpSessId)
    // console.log("TOKEN RELATORIO: ", req.query.tokenRelatorio)

    console.log("PHPSESSID: ", "f1g6fhskphsvk5aec6fja9h373")
    console.log("TOKEN RELATORIO: ", req.query.tokenRelatorio)
    
    const cookies = [{
      'name': 'PHPSESSID',
      'value': 'f1g6fhskphsvk5aec6fja9h373'
    //   'value': req.query.phpSessId
    }];

    await page.goto(`http://gama.controllab.com.br/`)

    await page.evaluate(() => {
        localStorage.setItem("indicadores", `{"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxODgzOjYzNDAiLCJhdWQiOjEsImlhdCI6MTU3OTcxNDQyMCwiZXhwIjoxNTc5NzI1MjIwfQ.F5j3f4FqxOjfavr6rvbvtEfecc9E7L3shUYkaU20AM0","idSegmento":1,"tokenExp":1579725220000,"perfilValid":false,"integracao":true,"userId":23226,"idPart":8012}`);
        // localStorage.setItem("indicadores", `${req.query.tokenRelatorio}`); 
    });

    await page.setCookie(...cookies)

    if(currentHost === 'gama')
        await page.goto(`http://gama.controllab.com.br/cionline/?action=${req.query.action}&menuqc=${req.query.menuqc}&RelatorioPage=1&IndicadoresSelecionados=${req.query.indicadores}&periodoInicial=${req.query.periodoInicial}&periodoFinal=${req.query.periodoFinal}&relatorioPuppeteer=1&tokenRelatorio=${req.query.tokenRelatorio}`);
    else
        await page.goto(`http://localhost:3000/?&RelatorioPage=1&IndicadoresSelecionados=${req.query.indicadores}&periodoInicial=${req.query.periodoInicial}&periodoFinal=${req.query.periodoFinal}&relatorioPuppeteer=1`);
    
    var qtdIndicadores = 1

    if(req.query.indicadores.indexOf(',') > -1)
        qtdIndicadores = req.query.indicadores.split(',').length
    
    console.log("Query String: ", req.query.indicadores)
    console.log("Total de Indicadores: ", qtdIndicadores)
    console.log("Action: ", req.query.action)
    console.log("MenuQC: ", req.query.menuqc)
            
    await page.waitFor(qtdIndicadores * 4000)
    await page.emulateMedia('screen')

    const pdfFile = await page.pdf({
        path: 'RelatorioIndicadores.pdf',
        format: 'A4',
        printBackground: true,
        displayHeaderFooter:true,
        margin:{
            bottom: "50px",
            top:"0px"
        },
        footerTemplate:' <div style="color: black; font-size: 10px; padding-top: 5px; text-align: center; width: 100%;"><span class="pageNumber"></span>/<span class="totalPages"></span></div>',
    })

    await browser.close();
    const path = './RelatorioIndicadores.pdf';
    res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdfFile.length })
    res.send(pdfFile)

    var dataFim = new Date().toLocaleDateString('en-GB')
    var dataFimArray = dataFim.split('-')
    var horaFim = new Date().toLocaleTimeString()
    console.log(`Terminou às: ${dataFim} - ${horaFim}`);
    console.log("======================================================================")

    fs.unlinkSync(path)
})

var server = app.listen(4006, "localhost", function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Listeneing at http://%s:%s', host, port);
});

server.timeout = 600000