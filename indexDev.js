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
    
    var dataInicio = new Date().toLocaleDateString()
    var dataInicioArray = dataInicio.split('-')
    var horaInicio = new Date().toLocaleTimeString()

    console.log("======================================================================")
    console.log(`Iniciou às: ${dataInicioArray[2]}/${dataInicioArray[1]}/${dataInicioArray[0]} - ${horaInicio}`);
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    
    if(currentHost === 'gama')
        await page.goto(`http://gama.controllab.com.br/cionline/?&RelatorioPage=1&IndicadoresSelecionados=${req.query.indicadores}&periodoInicial=${req.query.periodoInicial}&periodoFinal=${req.query.periodoFinal}&relatorioPuppeteer=1`);
    else
        await page.goto(`http://localhost:3000/?&RelatorioPage=1&IndicadoresSelecionados=${req.query.indicadores}&periodoInicial=${req.query.periodoInicial}&periodoFinal=${req.query.periodoFinal}&relatorioPuppeteer=1`);
    
    var qtdIndicadores = 1

    if(req.query.indicadores.indexOf(',') > -1)
        qtdIndicadores = req.query.indicadores.split(',').length
    
    console.log("QUERY String: ", req.query.indicadores)
    console.log("Total de Indicadores: ", qtdIndicadores)
        
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

    var dataFim = new Date().toLocaleDateString()
    var dataFimArray = dataFim.split('-')
    var horaFim = new Date().toLocaleTimeString()
    console.log(`Terminou às: ${dataFimArray[2]}/${dataFimArray[1]}/${dataFimArray[0]} - ${horaFim}`);
    console.log("======================================================================")

    fs.unlinkSync(path)
})

var server = app.listen(4006, "localhost", function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Listeneing at http://%s:%s', host, port);
});

server.timeout = 600000