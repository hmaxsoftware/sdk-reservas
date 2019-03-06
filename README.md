# hmax-reserva-online
Biblioteca de comunicação com API de reserva online da HMAX

[![travis build](https://img.shields.io/travis/hmaxsoftware/sdk-reservas.svg?style=flat-square)](https://travis-ci.org/hmaxsoftware/sdk-reservas)
[![codecov](https://codecov.io/gh/hmaxsoftware/sdk-reservas/branch/master/graph/badge.svg)](https://codecov.io/gh/hmaxsoftware/sdk-reservas)
[![version](https://img.shields.io/npm/v/@hmaxsoftware/sdk-reservas.svg?style=flat-square)](http://npm.im/@hmaxsoftware/sdk-reservas)
[![MIT](https://img.shields.io/npm/l/sdk-reservas.svg?style=flat-square)](https://spdx.org/licenses/MIT.html)

## Install

```bash
npm install @hmaxsoftware/sdk-reservas --save
```

## Usage

```js
// Carrega SDK de integração
const { ReservaOnlineClient } = require('sdk-reservas')

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
const { ReservaOnlineClient } = require('sdk-reservas')
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
const { ReservaOnlineClient } = require('sdk-reservas')
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
