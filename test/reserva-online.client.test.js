const assert = require('assert')
const ReservaOnlineClient = require('../src/reserva-online.client')

const defaultCredentials = {
    // Token de autenticação do integrador
    token: process.env.TEST_TOKEN || '39vr823n9246nv342',
    // Usuário de autenticação do hotel/pousada
    user: process.env.TEST_HOTEL_USER || 'hmax',
    // Senha de autenticação do hotel/pousada
    password: process.env.TEST_HOTEL_PASSWORD || 'hmax'
}

// Definir ambiente de testes
// ReservaOnlineClient.setTest(process.env.TEST_ON_PRODUCTION || true)

function getError(response, defaultMsg) {
    if (response.error) {
        if (typeof response.error === 'string') return response.error

        // Verifica se é array e retorna a lista de erros em string
        if (Array.isArray(response.error)) return response.error.reduce((result, item) => {
            return [...result, typeof item === 'string' ? item : item.error]
        }, []).join('\n')

        if (response.error.error) return response.error.error
    }
    return response.msg || defaultMsg || 'Erro não identificado'
}

describe('ReservaOnlineClient', () => {

    describe('#mapearPortal()', () => {
        it('deve realizar o mapeamento do Portal/OTA', async () => {
            const client = new ReservaOnlineClient(defaultCredentials)

            const ota = {
                nome: 'Portal/OTA Teste',
                id_integrador: '123-y',
                site: 'site_do_portal_ota_teste.com.br'
            }

            const res = await client.mapearPortal(ota.nome, ota.id_integrador, ota.site)
            assert.equal(res.success, true, getError(res))
        })
    })

    describe('#getPortais()', () => {
        it('deve retornar lista de portais/OTAs cadastrados na HMAX', async () => {
            const client = new ReservaOnlineClient(defaultCredentials)

            const res = await client.getPortais()
            assert.equal(Array.isArray(res), true, 'Não retornou array de OTAs')
            assert.equal(res.length > 0, true, 'Não retornou nenhum item na lista')

            for (const ota of res) {
                assert.equal(typeof ota.id, 'number', 'O código de identificação do Portal/OTA deve conter um número inteiro')
                assert.equal(typeof ota.nome, 'string', 'O nome do Portal/OTA deve conter uma string válida')
            }
        })
    })

    describe('#getCfgIntegrador()', () => {
        it('deve retornar lista configurações de integração', async () => {
            const client = new ReservaOnlineClient(defaultCredentials)
            
            const res = await client.getCfgIntegrador()
            assert.equal(res.hasOwnProperty('url_inventario'), true, 'Tag url_inventario ausente')
            assert.equal(res.hasOwnProperty('url_portais'), true, 'Tag url_portais ausente')
            assert.equal(res.hasOwnProperty('url_confirmacao'), true, 'Tag url_confirmacao ausente')
        })
    })

    describe('#setCfgIntegrador()', () => {
        it('Altera configurações de integração', async () => {
            const client = new ReservaOnlineClient(defaultCredentials)

            const cfgAnterior = await client.getCfgIntegrador()
            const cfgNova = {
                url_inventario: 'https://site_teste_do_integrador.com.br/api/v1/inventario',
                url_portais: 'https://site_teste_do_integrador.com.br/api/v1/portais',
                url_confirmacao: 'https://site_teste_do_integrador.com.br/api/v1/confirmacao'
            }

            // Atualiza configuração e valida retorno
            const res = await client.setCfgIntegrador(cfgNova)
            assert.equal(res.success, true, getError(res))

            // Ler configuração para validar se as informações foram salvas com sucesso
            const cfgLida = await client.getCfgIntegrador()
            assert.deepEqual(cfgLida, cfgNova, 'Não aplicou a configuração corretamente')
            
            // Voltar a configuração anterior
            await client.setCfgIntegrador(cfgAnterior)
        })
    })

    describe('#getCartoes()', () => {
        it('deve retornar lista de cartões aceitos pela HMAX', async () => {
            const client = new ReservaOnlineClient(defaultCredentials)

            const res = await client.getCartoes()
            assert.equal(Array.isArray(res), true, 'Não retornou array de cartões')
            assert.equal(res.length > 0, true, 'Não retornou nenhum item na lista')

            for (const cartao of res) {
                assert.equal(typeof cartao.id, 'number', 'O código de identificação do cartão deve conter um número inteiro')
                assert.equal(typeof cartao.nome, 'string', 'O nome do cartão deve conter uma string válida')
            }
        })
    })

    describe('#getCfgHotel()', () => {
        it('Deve retornar a lista de configurações do hotel', async () => {
            const client = new ReservaOnlineClient(defaultCredentials)

            const res = await client.getCfgHotel(defaultCredentials)
            assert.equal(res.hasOwnProperty('atualizar_inventario'), true, 'Propriedade atualizar_inventario ausente')
        })
    })

    describe('#setCfgHotel()', () => {
        it('Deve alterar configurações do hotel', async () => {
            const client = new ReservaOnlineClient(defaultCredentials)
            
            // Carrega configurações anterior
            const cfgAnterior = await client.getCfgHotel()            
            cfgAnterior.usuario = defaultCredentials.user
            cfgAnterior.senha = defaultCredentials.password

            // Define novas configurações
            const cfgNova = {
                atualizar_inventario: cfgAnterior.atualizar_inventario ? 0 : 1,
                usuario: 'usuario_novo',
                senha: 'senha_nova'
            }

            // Solicita alteração das configurações do hotel
            const res = await client.setCfgHotel(cfgNova)
            assert.equal(res.success, true, getError(res))

            // Verificar se configurações foi alterada com novas credenciais
            const novaRes = await client.getCfgHotel({user: cfgNova.usuario, password: cfgNova.senha})
            assert.equal(novaRes.atualizar_inventario, cfgNova.atualizar_inventario)

            // Redefinir configurações originais
            await client.setCfgHotel(cfgAnterior, {user: cfgNova.usuario, password: cfgNova.senha})
        })
    })

    describe('#getTiposApto()', () => {
        it('Deve retornar a lista de tipos de apto do hotel', async () => {
            const client = new ReservaOnlineClient(defaultCredentials)

            const res = await client.getTiposApto(defaultCredentials)
            assert.equal(Array.isArray(res), true, 'Não retornou array de tipos de apto')
            assert.equal(res.length > 0, true, 'Não retornou nenhum item na lista')

            for (const tipo of res) {
                assert.equal(typeof tipo.id, 'number', 'O código de identificação do tipo de apto deve ser um número inteiro')
                assert.equal(typeof tipo.nome, 'string', 'O nome do tipo de apto deve ser uma string válida')
            }
        })
    })

    describe('#enviarReservas()', () => {
        it('Deve permitir a inclusão de uma nova reserva', async () => {
            const client = new ReservaOnlineClient(defaultCredentials)
            const reserva = {
                id_integrador: '11301523',
                id_portal: '280123456',
                ativa: true,
                email: 'csolid.123456@guest.booking.com',
                nome: 'Cleidson Solid',
                obs: 'Observações da reserva',
                portal_id: 2,
                portal_id_integrador: 'booking',
                telefone: '4991238484',
                aptos: [{
                    id_integrador: '4',
                    apto_tipo_id: 169,
                    adultos: 3,
                    criancas: 0,
                    entrada: '2019-12-20 14:00:00',
                    saida: '2019-12-25 12:00:00',
                    status: '1',
                    obs: 'Observações do apto',
                    pacote: false,
                    valor: 600.00,
                    diarias: [
                        {data: '2018-08-01', valor: 600.00},
                        {data: '2018-08-02', valor: 650.95}
                    ],
                    hospedes: [
                        {id_integrador: 2721, nome: 'Cleidson Solid', tipo:'A'},
                        {id_integrador: 2722, nome: 'Acompanhante', tipo:'A'},
                        {id_integrador: 2723, nome: 'Acompanhante', tipo:'C'}
                    ],
                    depositos:[{
                        id_integrador: '1',
                        status: 1,
                        valor: 500.00,
                        pagamento: 1,
                        cartao: {
                            auth_code: 'abc',
                            chave_transacao: 'abc',
                            expira: '2020-02-01',
                            numero: '1234123412341234',
                            nome: 'CLEIDSON SOLID',
                            cartao_id: 1
                        }
                    }]
                }]
            }

            const res = await client.enviarReservas([reserva], defaultCredentials)
            assert.equal(res.success, true, getError(res))
        })
    })

    describe('#getInventario()', () => {
        it('Deve retornar a lista inventário/disponibilidade do hotel para período específico', async () => {
            const client = new ReservaOnlineClient(defaultCredentials)
            const inicio = new Date(2018, 10, 1)
            const fim = new Date(2018, 10, 30)

            const res = await client.getInventario(inicio, fim, defaultCredentials)
            assert.equal(Array.isArray(res), true, 'Não retornou array de disponibilidade')
            assert.equal(res.length > 0, true, 'Não retornou nenhum item na lista')

            for (const disp of res) {
                assert.equal(disp.hasOwnProperty('data'), true, 'Propriedade data ausente')
                assert.equal(disp.hasOwnProperty('inv'), true, 'Propriedade inv ausente')
                assert.equal(Array.isArray(disp.inv), true, 'A propriedade inv deveria retornar um Array')
                assert.equal(disp.inv.length > 0, true, 'Retornou inventário vazio')

                for (const inv of disp.inv) {
                    assert.equal(inv.hasOwnProperty('id'), true, 'Propriedade id ausente')
                    assert.equal(inv.hasOwnProperty('qtd'), true, 'Propriedade qtd ausente')
                    assert.equal(typeof inv.id, 'number', 'O código de identificação do inventário deve ser um número inteiro')
                    assert.equal(typeof inv.qtd, 'number', 'A quantidade do inventário deve ser um número inteiro')
                }
            }
        })
    })

})