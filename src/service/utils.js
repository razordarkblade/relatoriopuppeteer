const puppeteer = require('puppeteer');
const fs = require('fs');

module.exports = {
    relatorioIndicadores: async (req,res) =>{
        var dataInicio = new Date().toLocaleDateString('en-GB')
        var dataInicioArray = dataInicio.split('-')
        var horaInicio = new Date().toLocaleTimeString()
        var currentHost = req.query.currentHost
        
        if(!req.query.indicadores || !req.query.periodoInicial || !req.query.periodoFinal || !req.query.currentHost ) {
            res.statusMessage = "Parâmetro(s) incorreto(s)";
            res.status(404).send({message: res.statusMessage})
            return
        }else{
            res.status(200)
        }

        console.log("======================================================================")
        console.log(`Iniciou às: ${dataInicio} - ${horaInicio}`);
        let browser = null
        let tokenRel = null
        let siteUrl = '' 
        let page

        if(currentHost !== 'localhost'){
            browser = await puppeteer.launch({
                headless: true,
                executablePath:'./node_modules/puppeteer/.local-chromium/linux-706915/chrome-linux/chrome',
                ignoreDefaultArgs: ['--disable-extensions'], 
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            page = await browser.newPage();
            tokenRel = JSON.stringify(req.query.tokenRelatorio)

            if(currentHost === 'prod')
                siteUrl = 'https://controllab.com/'
            else
                siteUrl = 'http://gama.controllab.com.br/'

            await page.goto(siteUrl)
    
            await page.evaluate((tokenRel) => {
                localStorage.setItem("indicadores", tokenRel);
            }, tokenRel);

            const cookies = [{
                  'name': 'PHPSESSID',
                  'value': req.query.phpSessId
                },
                {
                    'name': 'SelLang',
                    'value': req.query.selLang
                }
            ];
            
            await page.setCookie(...cookies)
            await page.goto(`${siteUrl}cionline/?action=${req.query.action}&menuqc=${req.query.menuqc}&RelatorioPage=1&IndicadoresSelecionados=${req.query.indicadores}&periodoInicial=${req.query.periodoInicial}&periodoFinal=${req.query.periodoFinal}&relatorioPuppeteer=1`);
        }
        else{
            browser = await puppeteer.launch({headless: true});
            page = await browser.newPage();
            await page.goto(`http://localhost:3000/`)
            await page.goto(`http://localhost:3000/?&RelatorioPage=1&IndicadoresSelecionados=${req.query.indicadores}&periodoInicial=${req.query.periodoInicial}&periodoFinal=${req.query.periodoFinal}&relatorioPuppeteer=1`);
        }           
        
        var qtdIndicadores = 1
    
        if(req.query.indicadores.indexOf(',') > -1)
            qtdIndicadores = req.query.indicadores.split(',').length
        
        if(qtdIndicadores === 1 )
            await page.waitFor(10000)
        else
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
        res.status(200).send(pdfFile)
        fs.unlinkSync(path)
    
        var dataFim = new Date().toLocaleDateString('en-GB')
        var dataFimArray = dataFim.split('-')
        var horaFim = new Date().toLocaleTimeString()
        console.log(`Terminou às: ${dataFim} - ${horaFim}`);
        console.log("======================================================================")
    },
    

}