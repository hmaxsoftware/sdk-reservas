'use strict'

const http = require('http')
const https = require('https')
let test = false

/**
 * Classe cliente de comunicação com API de reservas da HMAX
 */
class ReservaOnlineClient {

    /**
     * @param {string|object} token Token de autenticação do integrador
     * @param {string} user Usuário de autenticação do hotel/pousada (opcional)
     * @param {string} password Senha de autenticação do hotel/pousada (opcional)
     */
    constructor(token, user, password) {
        if (typeof token === 'object') {
            this.token = token.token
            this.user = token.user
            this.password = token.password
        } else {
            this.token = token
            this.user = user
            this.password = password
        }
    }

    /**
     * Altera configuração de teste para não testar em ambiente de produção
     * @param {boolean} value Indicador de teste ativo/inativo
     */
    static setTest(value) {
        test = value
    }

    /**
     * Retornar data no formato padrão de comunicação yyyy-mm-dd
     * @param {Date} date 
     */
    getDateStr(date) {
        let y = date.getFullYear().toString();
        let m = (date.getMonth() + 1).toString();
        let d = date.getDate().toString();

        if (m.length < 2) m = '0' + m;
        if (d.length < 2) d = '0' + d;
        
        return `${y}-${m}-${d}`;
    }

    /**
     * Realiza a requisição para os serviços da HMAX
     * @param {string} method Método HTTP (GET, POST...)
     * @param {string} path Path adicionado à URL
     * @param {string|object} content Conteúdo da requisição
     * @param {object} credentials Credenciais de autenticação do hotel/pousada (opcional)
     * @param {string} credentials.user Usuário de autenticação do hotel/pousada
     * @param {string} credentials.password Senha de autenticação do hotel/pousada
     */
    doRequest(method, path, content, credentials) {
        let opt = {
            method: method,
            hostname: test ? 'localhost' : 'us-central1-hmax-reserva-online.cloudfunctions.net',
            port: test ? 8080 : 443,
            path: ['', ...(Array.isArray(path) ? path : path.split('/'))].join('/'),
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'cache-control': 'no-cache',
                'Token': credentials && credentials.token ? credentials.token : this.token
            }
        }

        if (credentials || this.user) opt.headers.User = credentials ? credentials.user : this.user
        if (credentials || this.password) opt.headers.Uassword = credentials ? credentials.password : this.password
          
        const protocol = test ? http : https
        return new Promise((resolve, reject) => {
            const req = protocol.request(opt, res => {
                const chunks = []
                res.setEncoding('utf8')
                res.on('data', chunk => {
                    chunks.push(chunk)
                })
                res.on('end', () => {
                    const response = {
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: chunks.join('')
                    }

                    if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300)
                        return resolve(response)
                    reject(response)
                })
            })
            req.on('error', e => reject(e))
            req.write(content ? (typeof content == 'object' ? JSON.stringify(content) : content) : '')
            req.end()
        })
    }

    /**
     * Mapear portal/OTA
     * @param {string} nome Nome do portal/OTA
     * @param {string} idIntegrador Código de identificação do portal/OTA no integrador
     * @param {string} site Site do portal/OTA
     * @returns {object}
     */
    mapearPortal(nome, idIntegrador, site) {
        const ota = {
            nome: nome,
            id_integrador: idIntegrador,
            site: site || null
        }
        return this.doRequest('POST', 'mapearPortal', ota)
            .then(res => JSON.parse(res.data))
    }

    /**
     * Consultar lista de portais/OTAs
     * @returns {Array}
     */
    getPortais() {
        return this.doRequest('GET', 'portais')
            .then(res => JSON.parse(res.data))
            .then(res => res.list)
    }

    /**
     * Consultar configurações gerais da integração
     * @returns {object}
     */
    getCfgIntegrador() {
        return this.doRequest('GET', 'cfgIntegrador')
            .then(res => JSON.parse(res.data))
    }

    /**
     * Alterar configurações gerais da integração
     * @param {object} cfg Configurações gerais do integrador
     * @param {string} cfg.url_inventario URL para atualizar inventário/disponibilidade no integrador
     * @param {string} cfg.url_portais URL para consultar portais/OTAs no integrador
     * @param {string} cfg.url_confirmacao URL para confirmação de processamento de reserva no integrador
     * @returns {object}
     */
    setCfgIntegrador(cfg) {
        return this.doRequest('POST', 'setCfgIntegrador', cfg)
            .then(res => JSON.parse(res.data))
    }

    /**
     * Consultar lista de cartões
     * @returns {Array}
     */
    getCartoes() {
        return this.doRequest('GET', 'cartoes')
            .then(res => JSON.parse(res.data))
            .then(res => res.list)
    }

    /**
     * Consultar configurações do hotel
     * @param {object} credentials Credenciais de autenticação do hotel/pousada (opcional)
     * @param {string} credentials.user Usuário de autenticação do hotel/pousada
     * @param {string} credentials.password Senha de autenticação do hotel/pousada
     * @returns {object}
     */
    getCfgHotel(credentials) {
        return this.doRequest('GET', 'cfgHotel', null, credentials)
            .then(res => JSON.parse(res.data))
    }

    /**
     * Alterar configurações de um hotel/pousada específico
     * @param {object} cfg Configurações do hotel/pousada
     * @param {boolean} cfg.atualizar_inventario Indicador de atualização de inventário/disponibilidade
     * @param {string} cfg.user Novo usuário de autenticação
     * @param {string} cfg.password Nova senha de autenticação
     * @param {object} credentials Credenciais de autenticação do hotel/pousada (opcional)
     * @param {string} credentials.user Usuário de autenticação do hotel/pousada
     * @param {string} credentials.password Senha de autenticação do hotel/pousada
     * @returns {object}
     */
    setCfgHotel(cfg, credentials) {
        return this.doRequest('POST', 'setCfgHotel', cfg, credentials)
            .then(res => JSON.parse(res.data))
    }

    /**
     * Consultar tipos de apto cadastrados no hotel
     * @param {object} credentials Credenciais de autenticação do hotel/pousada (opcional)
     * @param {string} credentials.user Usuário de autenticação do hotel/pousada
     * @param {string} credentials.password Senha de autenticação do hotel/pousada
     * @returns {object}
     */
    getTiposApto(credentials) {
        return this.doRequest('GET', 'tiposApto', null, credentials)
            .then(res => JSON.parse(res.data))
            .then(res => res.list)
    }

    /**
     * Incluir ou editar reservas
     * @param {Array} reservas Lista de reservas
     * @param {object} credentials Credenciais de autenticação do hotel/pousada (opcional)
     * @param {string} credentials.user Usuário de autenticação do hotel/pousada
     * @param {string} credentials.password Senha de autenticação do hotel/pousada
     * @returns {object}
     */
    enviarReservas(reservas, credentials) {
        return this.doRequest('POST', 'enviarReservas', reservas, credentials)
            .then(res => JSON.parse(res.data))
    }

    /**
     * Consultar inventário/disponibilidade de um período específico
     * @param {Date} inicio Data de início da consulta
     * @param {Date} fim Data de fim da consulta
     * @param {object} credentials Credenciais de autenticação do hotel/pousada (opcional)
     * @param {string} credentials.user Usuário de autenticação do hotel/pousada
     * @param {string} credentials.password Senha de autenticação do hotel/pousada
     * @param {object} [opt] Opções extras
     * @param {boolean} [opt.ocultarNaoMapeados] Indicador para mostrar tipos não mapeados (opcional)
     * @param {number[]} [opt.tipos] Códigos dos tipos específicos para filtro (opcional)
     * @returns {object}
     */
    getInventario(inicio, fim, credentials, opt) {
        let params = `inicio=${this.getDateStr(inicio)}&fim=${this.getDateStr(fim)}`
        
        if (opt && opt.ocultarNaoMapeados) params += `&nao_mapeados=false`
        if (opt && opt.tipos) params += `&tipos=${opt.tipos.join(',')}`

        return this.doRequest('GET', `inventario?${params}`, null, credentials)
            .then(res => JSON.parse(res.data))
            .then(res => res.list)
    }

}

module.exports = ReservaOnlineClient