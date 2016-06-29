import 'backbonefire';
import * as Backbone from 'backbone';
import User from '../Models/User';
import logger from '../logger';

const firebase = require('firebase');

export default class Users extends Backbone.Firebase.Collection<User> {
	get url() {
		return firebase.database().ref(`/users`);
	}
}
