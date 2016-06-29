import Pack from '../Models/Pack';
import * as Backbone from 'backbone';

const firebase = require('firebase');

export default class Packs extends Backbone.Firebase.Collection<Pack> {
	constructor(models = [], options = {autoSync: false}) {
		super(models, Object.assign({}, options, {model: Pack}));
	}

	get url() {
		return firebase.database().ref(`/packs`);
	}
}
