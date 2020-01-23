const express = require('express')
const puppeteer = require('puppeteer');
const fs = require('fs')
const routes = express.Router();
const Utils = require('./utils');

routes.get("/", (req, res) => {
    res.status(200).send({'ativo': true})
})


routes.get("/gerarRelatorioIndicadores",  (req, res) => {
    
     Utils.relatorioIndicadores(req,res)
   
})


routes.get("/jsonTest", (req, res) => {
    Utils.retornarJson(req, res)
})

module.exports = routes;

