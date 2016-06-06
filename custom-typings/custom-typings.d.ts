/// <reference path="backbonefire/backbonefire-global.d.ts" />
/// <reference path="shortid/shortid.d.ts" />

declare module "winston" {
	export var transports: any;
	export class Logger {
		rewriters: any[];

		constructor(opts: any);
		info(...args): void;
		warn(...args): void;
		error(...args): void;
		log(level: string, ...args): this;
		profile(info: string);

		// Adds a transport of the specified type to this instance.
		add(transport: any, options: any): this;
	}
}

declare module "winston-gcl" {
	export var GCL: any;
}

declare module "winston-firebase" {
	export var Firebase: any;
}

declare module "googleapis" {
	export var auth: any;
}