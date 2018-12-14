'use strict'

const https = require('https')

/**
 * Classe cliente de comunicação com API de reservas da HMAX
 */
class ReservaOnlineClient {

    /**
     * @param {string} token Token de autenticação do integrador
     * @param {string} user Usuário de autenticação do hotel/pousada (opcional)
     * @param {string} password Senha de autenticação do hotel/pousada (opcional)
     */
    constructor(token, user, password) {
        this.token = token
        this.user = user
        this.password = password
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
            hostname: 'reserva-online-dot-hmax-erp.appspot.com',
            port: 443,
            path: ['', ...(Array.isArray(path) ? path : path.split('/'))].join('/'),
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'cache-control': 'no-cache',
                'token': this.token
            }
        }

        if (credentials || this.user) opt.headers.user = credentials ? credentials.user : this.user
        if (credentials || this.password) opt.headers.user = credentials ? credentials.password : this.password
          
        return new Promise((resolve, reject) => {
            const req = https.request(opt, res => {
                res.setEncoding('utf8')
                res.on('data', data => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300)
                        return resolve({statusCode: res.statusCode, headers: res.headers, data: data})
                    reject({statusCode: res.statusCode, headers: res.headers, data: data})
                })
            })
            req.on('error', e => reject(e))
            req.write(typeof content == 'object' ? JSON.stringify(content) : content || '')
            req.end()
        })
    }

    /**
     * Rotina que retorna o mesmo conteúdo enviado para testar integridade do conteúdo,
     * forma de envio e recebimento.
     * @param {string} text Texto de teste
     */
    echo(text) {
        return this.doRequest('GET', ['echo', encodeURI(text)])
    }

    /**
     * Mapear portal/OTA
     * @param {string} nome Nome do portal/OTA
     * @param {string} idIntegrador Código de identificação do portal/OTA no integrador
     * @param {string} site Site do portal/OTA
     */
    mapearOTA(nome, idIntegrador, site) {
        const ota = {
            nome: nome,
            id_integrador: idIntegrador,
            site: site
        }
        return this.doRequest('POST', 'portal', ota)
    }

    /**
     * Consultar lista de portais/OTAs
     */
    getOTAs() {
        return this.doRequest('GET', 'portal')
    }

    /**
     * Consultar configurações gerais da integração
     */
    getCfg() {
        return this.doRequest('GET', 'cfg')
    }

    /**
     * Alterar configurações gerais da integração
     * @param {object} cfg Configurações gerais do integrador
     * @param {string} cfg.url_tipos_apto URL para consultar tipos de apto no integrador
     * @param {string} cfg.url_inventario URL para atualizar inventário/disponibilidade no integrador
     * @param {string} cfg.url_portais URL para consultar portais/OTAs no integrador
     * @param {string} cfg.url_confirmacao URL para confirmação de processamento de reserva no integrador
     * @param {string} cfg.url_reservas URL para consultar reservas no integrador no integrador
     */
    setCfg(cfg) {
        return this.doRequest('POST', 'cfg', cfg)
    }

    /**
     * Consultar rotas da API disponíveis
     */
    getRotas() {
        return this.doRequest('GET', 'rotas')
    }

    /**
     * Consultar lista de cartões
     */
    getCartoes() {
        return this.doRequest('GET', 'cartoes')
    }

    /**
     * Consultar configurações do hotel
     * @param {object} credentials Credenciais de autenticação do hotel/pousada (opcional)
     * @param {string} credentials.user Usuário de autenticação do hotel/pousada
     * @param {string} credentials.password Senha de autenticação do hotel/pousada
     */
    getCfgHotel(credentials) {
        return this.doRequest('GET', 'cfg-hotel', null, credentials)
    }

    /**
     * Alterar configurações de um hotel/pousada específico
     * @param {object} cfg Configurações do hotel/pousada
     * @param {boolean} cfg.atualizar_inventario Indicador de atualização de inventário/disponibilidade
     * @param {string} cfg.usuario Novo usuário de autenticação
     * @param {string} cfg.senha Nova senha de autenticação
     * @param {object} credentials Credenciais de autenticação do hotel/pousada (opcional)
     * @param {string} credentials.user Usuário de autenticação do hotel/pousada
     * @param {string} credentials.password Senha de autenticação do hotel/pousada
     */
    setCfgHotel(cfg, credentials) {
        return this.doRequest('POST', 'cfg-hotel', cfg, credentials)
    }

    /**
     * Incluir ou editar reservas
     * @param {Array} reservas Lista de reservas
     * @param {object} credentials Credenciais de autenticação do hotel/pousada (opcional)
     * @param {string} credentials.user Usuário de autenticação do hotel/pousada
     * @param {string} credentials.password Senha de autenticação do hotel/pousada
     */
    incluirEditarReserva(reservas, credentials) {
        return this.doRequest('POST', 'reserva', reservas, credentials)
    }

    /**
     * Consultar inventário/disponibilidade de um período específico
     * @param {Date} inicio Data de início da consulta
     * @param {Date} fim Data de fim da consulta
     * @param {object} credentials Credenciais de autenticação do hotel/pousada (opcional)
     * @param {string} credentials.user Usuário de autenticação do hotel/pousada
     * @param {string} credentials.password Senha de autenticação do hotel/pousada
     * @param {object} opt Opções extras de consulta 
     * @param {boolean} opt.ocultarNaoMapeados Indicador para mostrar tipos não mapeados
     * @param {number[]} opt.tipos Códigos dos tipos específicos para filtro
     */
    consultarInventario(inicio, fim, credentials, ocultarNaoMapeados, tipos) {
        let params = `inicio=${this.getDateStr(inicio)}&fim=${this.getDateStr(inicio)}`
        
        if (ocultarNaoMapeados) params += `&nao_mapeados=false`
        if (tipos) params += `&tipos=${tipos.join(',')}`

        return this.doRequest('GET', `disponibilidade?${params}`, null, credentials)
    }

}

module.exports = ReservaOnlineClient