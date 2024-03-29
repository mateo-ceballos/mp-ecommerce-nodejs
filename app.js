const MercadoPago = require('mercadopago');
const MercadoPagoConfig = MercadoPago.MercadoPagoConfig;
const Preference = MercadoPago.Preference;

// Initialize app
var express = require('express');
var exphbs = require('express-handlebars');
var port = process.env.PORT || 3000
var app = express();

// base url
const base_url = 'https://mateo-ceballos-mp-ecommerce-nodejs.onrender.com/';

// configure mercado pago
const client = new MercadoPagoConfig({
    accessToken: 'APP_USR-8709825494258279-092911-227a84b3ec8d8b30fff364888abeb67a-1160706432',
    integrator_id: 'dev_24c65fb163bf11ea96500242ac130004'
});

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    const preference = new Preference(client);

    preference.create({
        body: {
            payment_methods: {
                excluded_payment_methods: [
                    {
                        id: "visa"
                    }
                ],
                excluded_payment_types: [],
                installments: 6
            },
            payer: {
                name: 'Lalo',
                surname: 'Landa',
                email: 'test_user_36961754@testuser.com',
                phone: {
                    area_code: 54,
                    number: 3516201234
                },
                address: {
                    street_name: 'calle falsa',
                    street_number: 123,
                    zip_code: 5016
                }
            },
            external_reference: 'mceballoscolombo@gmail.com',
            items: [
                {
                    id: 1234,
                    title: req.query.title,
                    description: 'Dispositivo móvil de Tienda e-commerce',
                    picture_url: base_url + '/assests/' + '003.jpg', // TODO
                    quantity: 1,
                    unit_price: parseFloat(req.query.price),
                    currency_id: 'ARG'
                }
            ],
            back_urls: {
                success: base_url + 'success',
                failure: base_url + 'failure',
                pending: base_url + 'pending'
            },
            auto_return: 'approved',
            notification_url: base_url + 'notifications'
        }
    })
        .then(preferenceResponse => {
            const init_point = preferenceResponse.init_point
            res.render('detail', {...req.query, init_point});
        })
        .catch(console.log);
});

// Back urls
app.get('/success', function (req, res) {
    res.render('success', req.query);
});

app.get('/failure', function (req, res) {
    res.render('failure', req.query);
});

app.get('/pending', function (req, res) {
    res.render('pending', req.query);
});

// Notifications
app.post('/notifications', function (req, res) {
    console.log('Notification received');
    console.log(req.body);
    res.sendStatus(200);
});

app.listen(port);