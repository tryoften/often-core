import Subscription from '../Models/Subscription';
import * as Backbone from 'backbone';

const firebase = require('firebase');

export default class Subscriptions extends Backbone.Firebase.Collection<Subscription> {
	constructor() {
		super([], {
			model: Subscription,
			autoSync: true
		});
	}

	get url() {
		return firebase.database().ref(`/subscriptions`);
	}
}
