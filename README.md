# hmax-reserva-online
Biblioteca de comunicação com API de reserva online da HMAX

[![travis build](https://img.shields.io/travis/hmaxsoftware/sdk-reservas.svg?style=flat-square)](https://travis-ci.org/hmaxsoftware/sdk-reservas)
[![codecov](https://codecov.io/gh/hmaxsoftware/sdk-reservas/branch/master/graph/badge.svg)](https://codecov.io/gh/hmaxsoftware/sdk-reservas)
[![version](https://img.shields.io/npm/v/@hmaxsoftware/sdk-reservas.svg?style=flat-square)](http://npm.im/@hmaxsoftware/sdk-reservas)
[![MIT](https://img.shields.io/npm/l/@hmaxsoftware/sdk-reservas.svg?style=flat-square)](https://spdx.org/licenses/MIT.html)

## Install

```bash
npm install @hmaxsoftware/sdk-reservas --save
```

## Doc

[Link para documentação no Postman](https://documenter.getpostman.com/view/1414832/RzZ6JLrz)

## Usage

```js
// Carrega SDK de integração
const { ReservaOnlineClient } = require('@hmaxsoftware/sdk-reservas')

// Define credenciais de autenticação
const opt = {
    // Token de autenticação do integrador (Disponível no Sandbox da HMAX)
    token: '3bqo7c837ey8nm31070y',
    // Usuário de autenticação do hotel/pousada (Disponível no Sandbox da HMAX podendo alterar via API)
    user: 'hoteluser',
    // Senha de autenticação do hotel/pousada (Disponível no Sandbox da HMAX podendo alterar via API)
    password: 'hotelpassword'
}

// Instancia classe cliente de comunicação com a API de integração
const client = new ReservaOnlineClient(opt)

```

### Configurações de integração

```js
// Carrega SDK de integração
const { ReservaOnlineClient } = require('@hmaxsoftware/sdk-reservas')
const client = new ReservaOnlineClient({token: '3bqo7c837ey8nm31070y'})

// Caso queira atualizar apenas uma URL, remova as tags indesejadas e estas não serão alteradas
const dados = {
    url_inventario: 'https://site_teste_do_integrador.com.br/api/v1/inventario',
    url_portais: 'https://site_teste_do_integrador.com.br/api/v1/portais',
    url_confirmacao: 'https://site_teste_do_integrador.com.br/api/v1/confirmacao'
}

// Alterar configurações gerais
client.setCfgIntegrador(dados)
    .then(result => console.log('Configurações alteradas com sucesso', result))
    .catch(e => console.error('Falha ao alterar configurações', e))

// Consultar configurações gerais
client.getCfgIntegrador()
    .then(cfg => console.log(cfg))
    .catch(e => console.error('Falha ao carregar configurações', e))

// Consultar lista de cartões aceitos
client.getCartoes()
    .then(cartoes => console.log(cartoes))
    .catch(e => console.error('Falha ao carregar cartões', e))

// Consultar lista de portais/OTAs
client.getPortais()
    .then(otas => console.log(otas))
    .catch(e => console.error('Falha ao carregar lista de portais/OTAs', e))

// Cadastrar/Mapear novo portal/OTA
client.mapearPortal('Portal/OTA Teste', '123', 'site_do_portal_ota_teste.com.br')
    .then(result => console.log('Portal/OTA mapeado com sucesso'))
    .catch(e => console.error('Falha ao cadastrar/mapear portal/OTA', e))
```

### Configurações do hotel/pousada

```js
// Carrega SDK de integração
const { ReservaOnlineClient } = require('@hmaxsoftware/sdk-reservas')
const client = new ReservaOnlineClient({token: '3bqo7c837ey8nm31070y', user: 'hoteluser', password: 'hotelpassword'})

// Desativar atualização do inventário para o hotel/pousada em questão
client.setCfgHotel({atualizar_inventario: false})
    .then(result => console.log('Atualização de inventário/disponibilidade desativada', result))
    .catch(e => console.error('Falha ao desativar atualização de inventário/disponibilidade', e))

// Consultar configurações gerais
client.getCfgHotel()
    .then(cfg => console.log(cfg))
    .catch(e => console.error('Falha ao carregar configurações do hotel', e))

// Consultar lista de cartões aceitos
client.getCartoes()
    .then(cartoes => console.log(cartoes))
    .catch(e => console.error('Falha ao carregar cartões', e))

// Consultar lista de portais/OTAs
client.getPortais()
    .then(otas => console.log(otas))
    .catch(e => console.error('Falha ao carregar lista de portais/OTAs', e))

// Cadastrar/Mapear novo portal/OTA
client.mapearPortal('Portal/OTA Teste', '123', 'site_do_portal_ota_teste.com.br')
    .then(result => console.log('Portal/OTA mapeado com sucesso'))
    .catch(e => console.error('Falha ao cadastrar/mapear portal/OTA', e))

// Consultar lista de tipos de apto do hotel
client.getTiposApto()
    .then(tipos => console.log(tipos))
    .catch(e => console.error('Falha ao consultar lista de tipos de apto', e))
```

### Enviar reservas

```js
const { ReservaOnlineClient } = require('@hmaxsoftware/sdk-reservas')
const client = new ReservaOnlineClient({token: '3bqo7c837ey8nm31070y', user: 'hoteluser', password: 'hotelpassword'})

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
            {id_integrador: '2721', nome: 'Cleidson Solid', tipo:'A'},
            {id_integrador: '2722', nome: 'Acompanhante', tipo:'A'},
            {id_integrador: '2723', nome: 'Acompanhante', tipo:'C'}
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
// Desativar atualização do inventário para o hotel/pousada em questão
client.enviarReservas([reserva])
    .then(result => console.log('Reservas enviadas com sucesso', result))
    .catch(e => console.error('Falha ao enviar reservas', e))
```
