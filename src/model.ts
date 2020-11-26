import { Client, Token, ServerOptions, PasswordModel, User } from 'oauth2-server';
import Jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { Routes } from './routes';
import moment from 'moment';

const DOMAIN = 'localhost';
const PORT = 4001;
const accessTokenLifeTime = 0.5 * 60 * 60;

const clients: Client[] = [
	{
		id: 'application',
		clientId: 'application',
		clientSecret: 'secret',
		grants: ['password'],
	},
];

const tokens: Token[] = [];

const users: User[] = [
	{
		username: 'KKIVANC',
		password: 'NP321',
	},
];

const model: PasswordModel = {
	getUser: async (username, password) =>
		users.filter((u) => u.username === username && u.password === password)[0],
	getClient: async (clientId, clientSecret) =>
		clients.filter((c) => c.id === clientId && c.clientSecret === clientSecret)[0],
	getAccessToken: async (accessToken) => tokens.filter((t) => t.accessToken === accessToken)[0],
	verifyScope: async (token, scope) => token.scope === scope,
	saveToken: async (token, client, user) => {
		const previousTokenIndex = tokens.findIndex((t) => t.client.id === client.id)[0];
		if (previousTokenIndex !== -1) {
			delete tokens[previousTokenIndex];
		}
		token.client = client;
		token.user = user;
		tokens.push(token);

		return token;
	},
	generateAccessToken: async (client: Client, user: User, scope: string | string[]) => {
		const m = moment();
		const nowTimeStamp = m.unix();
		const jwtPayload = {
			iss: DOMAIN + ':' + PORT + Routes.OAUTH2_TOKEN, // (issuer): Issuer of the JWT
			sub: "SERVICE", // subject (whom the token refers to)
			aud: [DOMAIN + ':' + PORT + Routes.API_CONNECT], // (audience): Recipient for which the JWT is intended
			exp: m.clone().add(accessTokenLifeTime, 'seconds').unix(), // (expiration time): Time after which the JWT expires
			nbf: nowTimeStamp, // (not before time): Time before which the JWT must not be accepted for processing
			iat: nowTimeStamp, // (issued at time): Time at which the JWT was issued; can be used to determine age of the JWT
			auth_time: nowTimeStamp, // Time when authentication occured
			amr: client.grants, // Authentication methods array
			// client_id: client.id, // custom
			// idp: 'local', // custom
			// scope: "scope", // custom
		};
		const secret = client.clientSecret;
		const options: SignOptions = {
			algorithm: 'HS256',
		};
		return Jwt.sign(jwtPayload, secret, options);
	},
};

export const oAuthServerOptions: ServerOptions = {
	model: model,
	accessTokenLifetime: 12600,
	// allowBearerTokensInQueryString: true,
	// requireClientAuthentication: true,
	// allowExtendedTokenAttributes: false,
	// refreshTokenLifetime: 0.5 * 60 * 60,
};
