import express from 'express';
import bodyParser from 'body-parser';
import Oauth2Server, { Request, Response } from 'oauth2-server';
import { oAuthServerOptions } from './model';
import { Routes } from './routes';

const app = express();
const port = 4001;
const oauth2server = new Oauth2Server(oAuthServerOptions);

app.post(Routes.OAUTH2_TOKEN, bodyParser.urlencoded({ extended: true }), async (req, res, next) => {
	try {
		const request = new Request(req);
		const response = new Response(res);
    const token = await oauth2server.token(request, response);
    
    const ret: any = {...token};
    ret.access_token = token.accessToken;
    ret.token_type = "Bearer";
    ret.expires_in = token.accessTokenExpiresAt;
    ret.refresh_token = token.refreshToken;
    ret.scope = token.scope;

    delete ret.accessToken
    delete ret.accessTokenExpiresAt
    delete ret.refreshToken
    delete ret.scope

		res.json(ret);
	} catch (error) {
    next(error);
	}
});

app.post(Routes.API_CONNECT, bodyParser.json(), authenticate, async (req, res, next) => {
	try {
		res.send('your token is valid');
	} catch (error) {
		next(error);
	}
});

app.listen(port, () => {
	console.log(`Listening at localhost:${port}`);
});

async function authenticate(req, res, next) {
	try {
		debugger;
		const request = new Request(req);
		const response = new Response(res);
		await oauth2server.authenticate(request, response);
		next();
	} catch (error) {
		next(error);
	}
}
