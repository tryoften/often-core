import 'backbonefire';
import * as Backbone from 'backbone';
import Owner from '../Models/Owner';

const firebase = require('firebase');

export default class Owners extends Backbone.Firebase.Collection<Owner> {
	get url() {
		return firebase.database().ref(`/owners`);
	}
}
