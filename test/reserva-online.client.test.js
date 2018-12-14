const assert = require('assert')
const ReservaOnlineClient = require('../reserva-online.client')

const defaultCredentials = {
    // Token de autenticação do integrador
    token: process.env.TEST_TOKEN || '39vr823n9246nv342',
    // Usuário de autenticação do hotel/pousada
    user: process.env.TEST_HOTEL_USER || 'hmax',
    // Senha de autenticação do hotel/pousada
    password: process.env.TEST_HOTEL_PASSWORD || 'hmax'
}

describe('ReservaOnlineClient', () => {

    describe('#echo(text)', () => {
        it('deve retornar o texto enviado', async () => {
            const text = 'texto teste'
            const client = new ReservaOnlineClient(defaultCredentials)
            const response = await client.echo(text)

            try {
                const json = JSON.parse(response.data)
                assert.equal(json.success, true, 'Não retornou a tag sucesso')
                assert.equal(json.result, text, 'Texto diferente do esperado')
            } catch (error) {
                assert.fail(error.message)
            }
        })
    })

    // #mapearOTA(nome, idIntegrador, site)
    // #getOTAs()
    // #getCfg({url_tipos_apto, url_inventario, url_portais, url_confirmacao, url_reservas})
    // #setCfg()
    // #getRotas()
    // #getCartoes()

    // #getCfgHotel({user, password})

    // #incluirReserva(reserva, {user, password})
    // #editarReserva(reserva, {user, password})
    // #consultarInventario(inicio, fim, {user, password, mostarNaoMapeados, tipos})

})