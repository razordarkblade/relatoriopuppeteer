const request = require('supertest')
const puppeteer = require('puppeteer');
const app = require('../../src/service/routes')
const fs = require('fs')
const Utils = require('../../src/service/utils');
const httpMocks = require('node-mocks-http');


describe('Validação de Parametro ', () => {
    it('Indicadores sem parâmetro(s)', async() => {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/gerarRelatorioIndicadores?&periodoInicial=2018-01&periodoFinal=2018-12&currentHost=localhost&relatorioPuppeteer=1',            
        });

        const response = httpMocks.createResponse();
        await  Utils.relatorioIndicadores(request, response)
        expect(response.statusCode).toBe(404);
        expect(response.statusMessage).toEqual('Parâmetro(s) incorreto(s)');
    },60000);

    it('Indicadores com parâmetro(s)', async() => {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/gerarRelatorioIndicadores?indicadores=3,12&periodoInicial=2018-01&periodoFinal=2018-12&currentHost=localhost&relatorioPuppeteer=1',            
        });

        const response = httpMocks.createResponse();
        await  Utils.relatorioIndicadores(request, response);
        expect(response.statusCode).toBe(200);
    },60000);

});

