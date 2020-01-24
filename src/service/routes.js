const express = require('express')
const puppeteer = require('puppeteer');
const fs = require('fs')
const routes = express.Router();
const Utils = require('./utils');

routes.get("/", (req, res) => {
    res.status(200).send({'ativo': true})
})


routes.get("/gerarRelatorioIndicadores",  (req, res) => {
    try{
        Utils.relatorioIndicadores(req,res)
    }
    catch(error){
        res.send({err: error})
    }    
})

module.exports = routes;

